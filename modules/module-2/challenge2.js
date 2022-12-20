// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

const fromWallet = async (connection) => {
  try {
    const from = Keypair.generate();
    console.log(from);
    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(from.publicKey),
      2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: fromAirDropSignature,
    });
    return from;
  } catch (error) {
    console.error(error?.message);
  }
};

const getWalletBalance = async (connection, wallet) => {
  const walletBalance = await connection.getBalance(
    new PublicKey(wallet.publicKey)
  );
  const balanceInSol = parseInt(walletBalance) / LAMPORTS_PER_SOL;
  console.log(`Wallet balance: ${balanceInSol} SOL`);
  return walletBalance;
};

const transferSol = async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const from = await fromWallet(connection);
  const walletBalance = await getWalletBalance(connection, from);

  // Generate another Keypair (account we'll be sending to)
  const to = Keypair.generate();

  // Send money from "from" wallet and into "to" wallet
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: walletBalance / 2,
    })
  );

  // Sign transaction
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);
  console.log("Signature is ", signature);

  getWalletBalance(connection, from);
};

transferSol();
