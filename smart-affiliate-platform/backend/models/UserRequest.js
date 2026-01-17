const mongoose = require("mongoose");

const userRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    naturalLanguageQuery: {
      type: String,
      required: true,
    },
    parsedTags: {
      category: {
        type: String,
        index: true,
      },
      tags: [String],
      maxPrice: Number,
      minPrice: {
        type: Number,
        default: 0,
      },
      platforms: [String],
    },
    matchedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isFulfilled: {
      type: Boolean,
      default: false,
      index: true,
    },
    fulfilledAt: {
      type: Date,
      default: null,
    },
    notificationsSent: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        sentAt: Date,
      },
    ],
    status: {
      type: String,
      enum: ["ACTIVE", "FULFILLED", "EXPIRED", "CANCELLED"],
      default: "ACTIVE",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserRequest", userRequestSchema);
