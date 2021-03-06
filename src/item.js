const PurchaseResult = require('./PurchaseResult');

/**
 * Base class for all the purchasable "items".
 * 
 * @author Harri Pellikka
 */
class Item {
    /**
     * Constructs a new item
     * @param world World this item belongs to
     */
    constructor (world, name = "Nameless Item") {
        /**
         * World this item belongs to
         */
        this.world = world;

        /**
         * Modifiers applied to this item
         */
        this.modifiers = [];

        /**
         * The base price of the item (i.e. the price of the first level of this item)
         */
        this.basePrice = 1;//BigInteger.ONE;

        /**
         * Name of this item
         */
        this.name = name;

        /**
         * Description text for this item
         */
        this.description = "No description.";

        /**
         * Current level of this item
         */
        this.itemLevel = 0;

        /**
         * Max. item level
         */
        this.maxItemLevel = 99999999;//Long.MAX_VALUE;

        /**
         * Price multiplier per level. This is used in the price formula
         * like this: price = (base price) * (price multiplier) ^ (item level)
         */
        this.priceMultiplier = 1.145;
    }

    /**
     * Retrieves the name of this item
     *
     * @return {string} Name of this item
     */
    getName() {
        return this.name;
    }

    /**
     * Sets the name of this item
     *
     * @param name New name for this item
     */
    setName(name) {
        //if (name == null || name.length() == 0)
            //throw new RuntimeException("Item name cannot be null or empty");
        this.name = name;
    }

    /**
     * This method logs the given message to the browser console.
     *
     * @public
     * @method
     */
    getDescription() {
        return this.description;
    }

    setDescription(description) {
        this.description = description;
    }

    /**
     * Retrieves the base price of this item
     *
     * @return Base price of this item
     */
    getBasePrice() {
        return this.basePrice;
    }

    setBasePrice(basePrice) {
        this.basePrice = basePrice;
    }

    getPrice() {
        var tmp = this.basePrice;
        tmp = tmp * Math.pow(this.priceMultiplier, this.itemLevel);
        return tmp;
    }

    buyWith(currency) {
        //if (currency == null) throw new IllegalArgumentException("Currency cannot be null");
        if (this.itemLevel >= this.maxItemLevel)
            return PurchaseResult.MAX_LEVEL_REACHED;

        var price = this.getPrice();
        var result = currency.value - price;
		
        if (result < 0) {
            return PurchaseResult.INSUFFICIENT_FUNDS;
        }
        currency -= price;//currency.sub(price);
        this.upgrade();
        return PurchaseResult.OK;
    }

    /**
     * Sets the base price of this item
     *
     * @param basePrice New base price for this item
     */
    setBasePrice(basePrice) {
        if (basePrice == null) throw "Base price cannot be null";
        if (basePrice == 0)
            throw "Base price cannot be zero";

        this.basePrice = basePrice;
    }

    setBasePrice(basePrice) {
        this.basePrice = basePrice;//new BigInteger("" + basePrice);
    }

    /**
     * Retrieves the price multiplier
     *
     * @return Price multiplier
     */
    getPriceMultiplier() {
        return this.priceMultiplier;
    }

    /**
     * Sets the price multiplier of this item
     *
     * @param multiplier Price multiplier
     */
    setPriceMultiplier(multiplier) {
        this.priceMultiplier = multiplier;
    }

    getMaxItemLevel() {
        return this.maxItemLevel;
    }

    setMaxItemLevel(maxLvl) {
        if (maxLvl <= 0) throw "Max item level cannot be zero or negative";
        this.maxItemLevel = maxLvl;
    }

    getItemLevel() {
        return this.itemLevel;
    }

    setItemLevel(lvl) {
        this.itemLevel = lvl < 0 ? 0 : lvl > this.maxItemLevel ? this.maxItemLevel : lvl;
    }

    upgrade() {
        if (this.itemLevel < this.maxItemLevel) {
            this.itemLevel++;
        }
    }

    downgrade() {
        if (this.itemLevel > 0) {
            this.itemLevel--;
        }
    }

    maximize() {
        this.itemLevel = this.maxItemLevel;
    }
}

module.exports = Item;