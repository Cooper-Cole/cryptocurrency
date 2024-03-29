const Transaction = require('./transaction');
const Wallet = require('./wallet');

describe('Transaction', () => {
  let transaction, senderWallet, recipient, amount;

  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = 'recipient-address';
    amount = 50;
    transaction = new Transaction({ senderWallet, recipient, amount });
  });

  it('has an `id`', () => {
    expect(transaction).toHaveProperty('id');
  });

  describe('outputs', () => {
    it('has an `outputs`', () => {
      expect(transaction).toHaveProperty('outputs');
    });

    it('outputs the amount to the recipient', () => {
      expect(transaction.outputs[recipient]).toEqual(amount);
    });

    it('outputs the remaining balance for the `senderWallet`', () => {
      expect(transaction.outputs[senderWallet.address])
        .toEqual(senderWallet.balance - amount);
    });
  });

  describe('input', () => {
    it('has an `input`', () => {
      expect(transaction).toHaveProperty('input');
    });

    it('has a `timestamp` in the input', () => {
      expect(transaction.input).toHaveProperty('timestamp');
    });

    it('sets the `amount` to the `senderWallet` balance', () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    });

    it('sets the `address` to the `senderWallet` address', () => {
      expect(transaction.input.address).toEqual(senderWallet.address);
    });
  });
});