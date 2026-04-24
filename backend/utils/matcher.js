const Listing = require('../models/Listing');

// Maps a Need's type to the Listing type it should match
const NEED_TO_LISTING_TYPE = { buy: 'sell', rent: 'rent' };

const matchNeedToListings = async (need) => {
  const filter = {
    campus: need.campus,
    category: need.category,
    status: 'active',
    type: NEED_TO_LISTING_TYPE[need.type],
  };

  if (need.maxBudget != null) {
    filter.price = { $lte: need.maxBudget };
  }

  const matches = await Listing.find(filter).select('_id seller title price').lean();

  console.log(`[matcher] Matched ${matches.length} listings for need: "${need.title}"`);

  const listingIds = matches.map((m) => m._id);
  const sellerIds = [...new Set(matches.map((m) => m.seller.toString()))];

  return { listingIds, sellerIds };
};

module.exports = { matchNeedToListings };
