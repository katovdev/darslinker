import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    sections: {
      type: Array,
      default: [],
    },
    tags: [
      {
        label: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
    seo: {
      metaTitle: {
        type: String,
        default: "",
      },
      metaDescription: {
        type: String,
        default: "",
      },
      keywords: {
        type: [String],
        default: [],
      },
      canonicalUrl: {
        type: String,
        default: "",
      },
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    multiViews: {
      type: Number,
      default: 0,
    },
    uniqueViews: {
      type: [String],
      default: [],
    },
    isArchive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Add indexes for better performance
blogSchema.index({ title: 1 });
blogSchema.index({ categoryId: 1 });
blogSchema.index({ isArchive: 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ "seo.keywords": 1 });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;