/*
    private Generator(World world) {
        super(world);
    }


    private Generator(World world, String name) {
        super(world, name);
    }
*/

const Item = require('./item');

class Generator extends Item {
    constructor(build){
        super(build.mWorld, build.mName);

        this.maxItemLevel = build.mMaxLevel;
        this.amountMultiplier = build.mAmountMultiplier;
        this.useRemainder = build.mUseRemainder;
        this.timesProcessed = build.mTimesProcessed;
        this.currency = build.mCurrency;
        this.baseAmount = build.mBaseAmount;
        

        this.remainder = 0;
        this.modifiers = [];
    }

	static get Builder() {
        class Builder {
            constructor(world) {
                this.mWorld = world;
                this.mName = "Nameless generator";
                this.mOnProcessed = null;
                this.mCurrency = null;
                this.mBaseAmount = 1;
                this.mAmountMultiplier = 1.1;
                this.mMaxLevel = 999999999;
                this.mBasePrice = 999999999;//BigInteger.ONE;
                this.mPriceMultiplier = 1.1;
                this.mProbability = 1.0;
                this.mProbabilitySet = false;
                this.mUseRemainder = true;
                this.mCooldown = 0.0;
                this.mTimesProcessed = 0;
            }
            /**
             * Sets the cooldown of this generator (in seconds).
             * This is the minimum time between processing this
             * generator.
             *
             * @param cooldown in seconds
             * @return This builder for chaining
             */
            cooldown(cooldown) {
                this.cooldown = cooldown;
                return this;
            }

            /**
             * Store remainder of resources and generate an extra
             * when the remainder "overflows"
             *
             * @return This builder for chaining
             */
            useRemainder() {
                this.useRemainder = true;
                return this;
            }

            /**
             * Discard remainder of resources when generating.
             *
             * @return This builder for chaining
             */
            discardRemainder() {
                this.useRemainder = false;
                return this;
            }

            /**
             * Sets the name for the generator
             *
             * @param name Name for the generator
             * @return This builder for chaining
             */
            name(name) {
                this.name = name;
                return this;
            }

            /**
             * Sets the multiplier for resource generation. This multiplier
             * is used in the formula (amount) = (base amount) * (multiplier) ^ (level)
             *
             * @param multiplier Amount generation multiplier per level
             * @return This builder for chaining
             */
            multiplier(multiplier) {
                this.mAmountMultiplier = multiplier;
                return this;
            }

            /**
             * Sets the maximum allowed level for this generator. The max level must
             * be greated than zero.
             *
             * @param maxLevel Maximum allowed level for this generator
             * @return This builder for chaining
             */
            /*this.maxLevel = function(maxLevel) {
                //if (maxLevel <= 0)
                //    throw new IllegalArgumentException("Max level must be greater than 0");
                self.maxLevel = maxLevel;
                return this;
            }*/

            /**
             * Sets the base amount of resources generated by this generator.
             * This is the amount the generator generates at level 1 and is used
             * as the base for the higher levels.
             *
             * @param amount Base amount of resources generated at level 1
             * @return This builder for chaining
             */
            baseAmount(amount) {
                //if (amount == null) throw new IllegalArgumentException("Base amount cannot be null");
                this.mBaseAmount = amount;
                return this;
            }

            /**
             * Sets the currency that should be generated by the generator.
             *
             * @param resource Resource to generate
             * @return This builder for chaining
             * @throws IllegalArgumentException Thrown if the currency is null
             */
            generate(resource) { //throws IllegalArgumentException {
                //if (resource == null) throw new IllegalArgumentException("Currency cannot be null");
                this.mCurrency = resource;
                return this;
            }

            /**
             * Sets a callback for the generator to be called when the generator
             * has finished its processing cycle (i.e. has generated something).
             *
             * @param callback Callback to call after generating something
             * @return This builder for chaining
             */
            callback(callback) {
                this.onProcessed = callback;
                return this;
            }

            price(price) {
                this.basePrice = price;
                return this;
            }

            priceMultiplier(multiplier) {
                this.priceMultiplier = multiplier;
                return this;
            }

            /**
             * Set a probability for this generator to "work" when it's processed
             *
             * @param probability Probability percentage (between 0.0 and 1.0)
             * @return This builder for chaining
             */
            probability(probability) {
                //if (probability < 0 || probability > 1.0)
                //    throw new IllegalArgumentException("Probability should be between 0.0 and 1.0");
                this.probability = probability;
                this.probabilitySet = true;
                
                return this;
            }

            build() {
                return new Generator(this);
            }
        }

        return Builder;
    }

	equals(a,b) {
		return JSON.stringify(a) === JSON.stringify(b);
	}
	
	/*this.itemLevel =0;
	this.maxItemLevel =0;
	this.modifiers = [];
	this.amountMultiplier = 0;
	this.useRemainder = true;
	this.timesProcessed = 0;
	this.remainder = 0;*/
	
	upgrade() {
		if (this.itemLevel < this.maxItemLevel) {
            this.itemLevel++;
        }
	}

    /**
     * Downgrades this generator by one level
     */
    downgrade() {
        if (this.itemLevel > 0) {
            this.itemLevel--;
        }
    }

    /**
     * Retrieves the amount this generator currently is generating per
     * processing cycle
     *
     * @return Amount of resources generated by this generator
     * BIG INTEGER
     */
    getGeneratedAmount() {
        if (this.itemLevel == 0) return 0;

        var tmp = this.baseAmount;
        tmp = tmp * Math.pow(this.amountMultiplier, this.itemLevel - 1);

        if (this.useRemainder) {
			//if 1 divided in tmp
            //var tmpRem = tmp.remainder(BigDecimal.ONE).doubleValue();
            var tmpRem = tmp % 1;
            this.remainder += tmpRem;
            if (this.remainder >= 0.999) {
                this.remainder -= 1.0;
                tmp = tmp + 1;
            }
        }
        tmp = this.processModifiers(tmp);

        return parseInt(tmp);
    }

    processModifiers(val) {
        if (this.modifiers.length == 0) return val;

        for(var i = 0; i<this.modifiers.length; i++){
            var d = this.modifiers[i].getMultiplier();

            if (d != 1.0) {
                val = val * d;
            }
        }

        return val;
    }

    /**
     * Determines if this generator should generate anything based on its
     * properties such as item level and probability.
     *
     * @return True if should work, false otherwise
     */
    isWorking() {
        if (this.itemLevel > 0) {
            if (!this.useProbability || Math.Random() < this.probability) return true;
        }
		
        return false;
    }

    /**
     * Processes this generator, generating resources as per the rules
     * of this generator.
     */
    process() {
        if (this.isWorking()) {
            this.currency.add(this.getGeneratedAmount());
            this.timesProcessed++;
            //if (callback != null) callback.onProcessed();
        }
    }

    /**
     * Retrieves the number of times this generator has done its processing
     *
     * @return Number of times processed
     */
    getTimesProcessed() {
        return this.timesProcessed;
    }

    attachModifier(modifier) {
        if (modifier && !this.modifiers.contains(modifier)) {
            this.modifiers.push(modifier);
        }
    }

    detachModifier(modifier) {
        if (modifier) {
            this.modifiers.remove(modifier);
        }
    }
}

module.exports = Generator;