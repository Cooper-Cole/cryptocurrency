const Wallet = require('./wallet');
const Transaction = require('./transaction');
const Blockchain = require('./blockchain');
const { STARTING_BALANCE } = require('./config');

describe('Wallet', () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('has a `balance`', () => {
    expect(wallet).toHaveProperty('balance');
  });

  it('has a `address`', () => {
    expect(wallet).toHaveProperty('address');
  });

  describe('createTransaction()', () => {
    describe('and the amount exceeds the balance', () => {
      it('throws an error', () => {
        expect(() => wallet.createTransaction({ amount: 999999, recipient: 'foo-recipient' }))
          .toThrow('Amount exceeds balance');
      });
    });

    describe('and the amount is valid', () => {
      let transaction, amount, recipient;

      beforeEach(() => {
        amount = 50;
        recipient = 'foo-recipient';
        transaction = wallet.createTransaction({ amount, recipient });
      });

      it('creates an instance of `Transaction`', () => {
        expect(transaction instanceof Transaction).toBe(true);
      });

      it('matches the transaction input with the wallet', () => {
        expect(transaction.input.address).toEqual(wallet.address);
      });

      it('outputs the amount the recipient', () => {
        expect(transaction.outputs[recipient]).toEqual(amount);
      });
    });

    describe('and a chain is passed', () => {
      it('calls `Wallet.calculateBalance`', () => {
        const calculateBalanceMock = jest.fn();

        const originalCalculateBalance = Wallet.calculateBalance;

        Wallet.calculateBalance = calculateBalanceMock;

        wallet.createTransaction({
          recipient: 'foo',
          amount: 10,
          chain: new Blockchain().chain
        });

        expect(calculateBalanceMock).toHaveBeenCalled();

        Wallet.calculateBalance = originalCalculateBalance;
      });
    });
  });

  describe('calculateBalance()', () => {
    let blockchain;

    beforeEach(() => {
      blockchain = new Blockchain();
    });

    describe('and there are no outputs for the wallet', () => {
      it('returns the `STARTING_BALANCE`', () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.address
          })
        ).toEqual(STARTING_BALANCE);
      });
    });

    describe('and there are outputs for the wallet', () => {
      let transactionOne, transactionTwo;

      beforeEach(() => {
        transactionOne = new Wallet().createTransaction({
          recipient: wallet.address,
          amount: 50
        });

        transactionTwo = new Wallet().createTransaction({
          recipient: wallet.address,
          amount: 60
        });

        blockchain.addBlock({ data: transactionOne });

        blockchain.addBlock({ data: transactionTwo });
      });

      it('adds the sum of all outputs to the wallet balance', () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.address
          })
        ).toEqual(
          STARTING_BALANCE +
          transactionOne.outputs[wallet.address] +
          transactionTwo.outputs[wallet.address]
        );
      });

      describe('and the wallet has made a transaction', () => {
        let recentTransaction;

        beforeEach(() => {
          recentTransaction = wallet.createTransaction({
            recipient: 'foo-address',
            amount: 30
          });

          blockchain.addBlock({ data: recentTransaction });
        });

        it('returns the output amount of the recent transaction', () => {
          expect(
            Wallet.calculateBalance({
              chain: blockchain.chain,
              address: wallet.address
            })
          ).toEqual(
            recentTransaction.outputs[wallet.address] +
            transactionOne.outputs[wallet.address] +
            transactionTwo.outputs[wallet.address]
          );
        });
      });
    });
  });
});