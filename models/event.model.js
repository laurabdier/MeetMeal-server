const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
      hour: {
        type: Number,
        min: 0,
        max: 23,
        required: true
      },
      minutes: {
        type: Number,
        min: 0,
        max: 59,
        required: true
      }
  },
  typeOfCuisine: {
    type: String,
    enum: ['Americaine', 'Argentine', 'Bresilienne', 'Chinoise', 'Espagnole', 'Française', 'Grecque', 'Indienne', 'Italienne', 'Japonaise', 'Libanaise', 'Marocaine', 'Mexicaine', 'Thaïlandaise', 'Peruvien', 'Vegan', 'Vegetarienne', 'Vietnamienne', 'Autre'],
    required: true
  },
  typeOfMeal: {
    type: String,
    enum: ['Petit-Dejeuner', 'Brunch', 'Dejeuner', 'Diner', 'Apero', 'Pique-Nique'],
    required: true
  },
  description: {
    type: String
  },
  menu: {
    type: String
  },
  allergens: {
    type: String
  },
  zipCode: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  numberMaxOfGuests: {
    type: Number,
    required: true
  },
  guests: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      status: {
        type: String,
        enum: ['En attente', 'Accepte', 'Refuse'],
        default: 'En attente'
      }
    }
  ],
  comments: [
    {
      content: {
        type: String
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  status: {
    type: String,
    enum: ['En attente', 'Accepte', 'Refuse'],
    default: 'En attente'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  cost: {
    type: Number,
    required: true
  }
});
module.exports = Event = mongoose.model('event', EventSchema);
