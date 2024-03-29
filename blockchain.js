const Block = require('./block');
const cryptoHash = require('./crypto-hash')

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  /**
   * Adds a new block
   * 
   * @param { data } data dictionary
   */
  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length-1],
      data
    });

    this.chain.push(newBlock);
  }

  /**
   * Checks whether a chain of a blockchain is valid
   * Hints:
   * 1. Validate the genesis block
   * 2. Loop through the chain:
   *    - Validate if chain[i].prevHash === chain[i-1].hash 
   *    - Validate if chain[i].hash is valid
   * 
   * @param chain the chain of a blockchain to check
   * @return true if valid, false otherwise
   */
  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    };

    for (let i=1; i<chain.length; i++) {
      const { timestamp, prevHash, hash, nonce, difficulty, data } = chain[i];
      const actualprevHash = chain[i-1].hash;

      if (prevHash !== actualprevHash) {
        return false;
      } 

      const validatedHash = cryptoHash(timestamp, prevHash, data, nonce, difficulty);

      if (hash !== validatedHash) {
        return false;
      }
    }

    return true;
  }

  /**
   * Replaces current chain with longest chain
   * Hints: Need to check if the incoming chain is longer and valid. 
   *        If true, then replace. Otherwise, write to console the status 
   *        of the incoming chain.
   * 
   * @param {chain} the new chain 
   */
  replaceChain(chain) {
    if (chain.length <= this.chain.length) {
      console.error('The incoming chain must be longer');
      return;
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error('The incoming chain must be valid');
      return;
    }

    console.log('replacing chain with', chain);
    this.chain = chain;
  }
}

module.exports = Blockchain;