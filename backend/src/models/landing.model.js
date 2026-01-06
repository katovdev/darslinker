import mongoose from 'mongoose';

const landingSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: 'Welcome to My Courses'
  },
  subtitle: {
    type: String,
    default: 'Learn from expert instructor'
  },
  description: {
    type: String,
    default: 'Discover amazing courses and start your learning journey today.'
  },
  heroImage: {
    type: String,
    default: ''
  },
  heroText: {
    type: String,
    default: 'DASTURLASH NI\nPROFESSIONAL\nO\'QITUVCHI BILAN O\'RGANING'
  },
  logoText: {
    type: String,
    default: 'DarsLinker'
  },
  primaryColor: {
    type: String,
    default: '#7ea2d4'
  },
  backgroundColor: {
    type: String,
    default: '#1a1a1a'
  },
  textColor: {
    type: String,
    default: '#ffffff'
  },
  showCourses: {
    type: Boolean,
    default: true
  },
  showAbout: {
    type: Boolean,
    default: true
  },
  aboutText: {
    type: String,
    default: ''
  },
  socialLinks: {
    telegram: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  customCSS: {
    type: String,
    default: ''
  },
  customUrl: {
    type: String,
    default: '',
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Custom URL can only contain lowercase letters, numbers, and hyphens'],
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Landing = mongoose.model('Landing', landingSchema);

export default Landing;