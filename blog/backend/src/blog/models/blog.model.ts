import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlogDocument = Blog & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Blog {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  subtitle: string;

  @Prop({ type: Array, default: [] })
  sections: any[];

  @Prop({
    type: [{
      label: { type: String, required: true },
      value: { type: String, required: true }
    }],
    default: []
  })
  tags: Array<{ label: string; value: string }>;

  @Prop({
    type: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      keywords: { type: [String], default: [] },
      canonicalUrl: { type: String, default: '' }
    },
    default: {}
  })
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'Category', required: false })
  categoryId?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  multiViews: number;

  @Prop({ type: [String], default: [] })
  uniqueViews: string[];

  @Prop({ type: Boolean, default: false })
  isArchive: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);