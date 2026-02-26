/**
 * Top Picks by Category
 * Curated "Top Pick" and "Top 3" for quick customer discovery
 */

export const TOP_PICKS_BY_CATEGORY: Record<
  string,
  { topPick: string; topThree: string[] }
> = {
  cookware: {
    topPick: 'lodge-cast-iron-skillet',
    topThree: ['lodge-cast-iron-skillet', 'le-creuset-dutch-oven', 'all-clad-d3-fry-pan'],
  },
  bakeware: {
    topPick: 'if-you-care-parchment',
    topThree: ['if-you-care-parchment'],
  },
  storage: {
    topPick: 'stasher-silicone-bags',
    topThree: ['stasher-silicone-bags', 'oxo-glass-containers'],
  },
  'food-storage': {
    topPick: 'stasher-silicone-bags',
    topThree: ['stasher-silicone-bags', 'oxo-glass-containers'],
  },
  utensils: {
    topPick: '',
    topThree: [],
  },
  'utensils-tools': {
    topPick: '',
    topThree: [],
  },
  appliances: {
    topPick: '',
    topThree: [],
  },
  'appliance-accessories': {
    topPick: '',
    topThree: [],
  },
};
