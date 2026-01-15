import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class AdviceController {
  // Create new advice request
  async createAdvice(req, res) {
    try {
      const { name, phone, comment } = req.body;

      // Validation
      if (!name || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Ism va telefon raqami majburiy!'
        });
      }

      // Phone format validation
      const phoneRegex = /^\+998 [0-9]{2} [0-9]{3} [0-9]{2} [0-9]{2}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Telefon raqami formati noto\'g\'ri!'
        });
      }

      // Create advice
      const advice = await prisma.advice.create({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          comment: comment ? comment.trim() : null
        }
      });

      res.status(201).json({
        success: true,
        message: 'Maslahat so\'rovi muvaffaqiyatli yuborildi!',
        data: {
          id: advice._id,
          name: advice.name,
          phone: advice.phone,
          comment: advice.comment,
          status: advice.status,
          createdAt: advice.createdAt
        }
      });

    } catch (error) {
      console.error('Create advice error:', error);
      res.status(500).json({
        success: false,
        message: 'Server xatosi yuz berdi!'
      });
    }
  }

  // Get all advice requests (for moderator)
  async getAllAdvices(req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const take = parseInt(limit) || 10;
      const skip = (parseInt(page) - 1) * take;

      const where = {};

      if (status && status !== 'all') {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { comment: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, advices] = await Promise.all([
        prisma.advice.count({ where }),
        prisma.advice.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take
        })
      ]);

      res.json({
        success: true,
        data: {
          advices,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get advices error:', error);
      res.status(500).json({
        success: false,
        message: 'Server xatosi yuz berdi!'
      });
    }
  }

  // Get advice by ID
  async getAdviceById(req, res) {
    try {
      const { id } = req.params;

      const advice = await prisma.advice.findUnique({ where: { id } });

      if (!advice) {
        return res.status(404).json({
          success: false,
          message: 'Maslahat so\'rovi topilmadi!'
        });
      }

      res.json({
        success: true,
        data: advice
      });

    } catch (error) {
      console.error('Get advice by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Server xatosi yuz berdi!'
      });
    }
  }

  // Update advice status
  async updateAdviceStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'contacted', 'resolved'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Noto\'g\'ri status!'
        });
      }

      const advice = await prisma.advice.findUnique({ where: { id } });

      if (!advice) {
        return res.status(404).json({
          success: false,
          message: 'Maslahat so\'rovi topilmadi!'
        });
      }

      await prisma.advice.update({
        where: { id },
        data: { status }
      });

      res.json({
        success: true,
        message: 'Status muvaffaqiyatli yangilandi!',
        data: advice
      });

    } catch (error) {
      console.error('Update advice status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server xatosi yuz berdi!'
      });
    }
  }

  // Delete advice
  async deleteAdvice(req, res) {
    try {
      const { id } = req.params;

      const advice = await prisma.advice.findUnique({ where: { id } });

      if (!advice) {
        return res.status(404).json({
          success: false,
          message: 'Maslahat so\'rovi topilmadi!'
        });
      }

      await prisma.advice.delete({ where: { id } });

      res.json({
        success: true,
        message: 'Maslahat so\'rovi o\'chirildi!'
      });

    } catch (error) {
      console.error('Delete advice error:', error);
      res.status(500).json({
        success: false,
        message: 'Server xatosi yuz berdi!'
      });
    }
  }

  // Get advice statistics
  async getAdviceStats(req, res) {
    try {
      const total = await prisma.advice.count();
      const pending = await prisma.advice.count({ where: { status: 'pending' } });
      const contacted = await prisma.advice.count({ where: { status: 'contacted' } });
      const resolved = await prisma.advice.count({ where: { status: 'resolved' } });

      // Get recent advices (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recent = await prisma.advice.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      });

      res.json({
        success: true,
        data: {
          total,
          pending,
          contacted,
          resolved,
          recent
        }
      });

    } catch (error) {
      console.error('Get advice stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server xatosi yuz berdi!'
      });
    }
  }
}

const adviceController = new AdviceController();

export const createAdvice = adviceController.createAdvice.bind(adviceController);
export const getAllAdvices = adviceController.getAllAdvices.bind(adviceController);
export const getAdviceById = adviceController.getAdviceById.bind(adviceController);
export const updateAdviceStatus = adviceController.updateAdviceStatus.bind(adviceController);
export const deleteAdvice = adviceController.deleteAdvice.bind(adviceController);
export const getAdviceStats = adviceController.getAdviceStats.bind(adviceController);