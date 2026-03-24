import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Meridian } from "../target/types/meridian";
import { 
  PublicKey, 
  SystemProgram, 
  Keypair, 
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  createAccount, 
  mintTo, 
  getAccount 
} from "@solana/spl-token";
import { expect } from "chai";

describe("meridian", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Meridian as Program<Meridian>;
  const admin = (provider.wallet as anchor.Wallet).payer;
  const depositor = Keypair.generate();
  const nonWhitelisted = Keypair.generate();

  let mint: PublicKey;
  let adminTokenAccount: PublicKey;
  let depositorTokenAccount: PublicKey;
  let vaultPDA: PublicKey;
  let vaultBump: number;
  let vaultTokenAccount: PublicKey;
  let mandatePDA: PublicKey;
  let whitelistPDA: PublicKey;
  let positionPDA: PublicKey;

  before(async () => {
    // Airdrop SOL to depositor
    const signature = await provider.connection.requestAirdrop(depositor.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(signature);

    // Create USDC Mock Mint
    mint = await createMint(provider.connection, admin, admin.publicKey, null, 6);
    
    // Create token accounts
    depositorTokenAccount = await createAccount(provider.connection, admin, mint, depositor.publicKey);
    
    // Mint some mock USDC to depositor
    await mintTo(provider.connection, admin, mint, depositorTokenAccount, admin, 10_000_000_000); // 10k USDC

    [vaultPDA, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), admin.publicKey.toBuffer()],
      program.programId
    );

    [mandatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("mandate"), vaultPDA.toBuffer()],
      program.programId
    );

    [whitelistPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("whitelist"), vaultPDA.toBuffer()],
      program.programId
    );

    [positionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("position"), vaultPDA.toBuffer(), depositor.publicKey.toBuffer()],
      program.programId
    );
  });

  describe("initialize_vault", () => {
    it("Initializes the vault with Conservative risk tier", async () => {
      // Find vault token account (it's initialized in the instruction)
      const vaultTokenAccountKP = Keypair.generate();
      vaultTokenAccount = vaultTokenAccountKP.publicKey;

      await program.methods
        .initializeVault("Meridian Alpha", { conservative: {} })
        .accounts({
          admin: admin.publicKey,
          vault: vaultPDA,
          tokenMint: mint,
          vaultTokenAccount: vaultTokenAccount,
          mandate: mandatePDA,
          whitelist: whitelistPDA,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([vaultTokenAccountKP])
        .rpc();

      const vaultAcc = await program.account.vault.fetch(vaultPDA);
      expect(vaultAcc.kaminoAlloc).to.equal(8000);
      expect(vaultAcc.marginfiAlloc).to.equal(2000);
    });
  });

  describe("deposit", () => {
    it("Rejects non-whitelisted depositor", async () => {
        try {
            await program.methods
                .deposit(new anchor.BN(1000_000_000))
                .accounts({
                    depositor: nonWhitelisted.publicKey,
                    depositorTokenAccount: depositorTokenAccount, // Placeholder
                    vault: vaultPDA,
                    vaultTokenAccount: vaultTokenAccount,
                    position: positionPDA, // Incorrect but will fail at whitelist
                    whitelist: whitelistPDA,
                    kaminoAccount: admin.publicKey,
                    marginfiAccount: admin.publicKey,
                    driftAccount: admin.publicKey,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .signers([nonWhitelisted])
                .rpc();
            expect.fail("Should have failed");
        } catch (e) {
            expect(e.toString()).to.include("NotWhitelisted");
        }
    });

    it("Deposits 1,000 USDC successfully", async () => {
      const amount = new anchor.BN(1000_000_000);

      await program.methods
        .deposit(amount)
        .accounts({
          depositor: depositor.publicKey,
          depositorTokenAccount: depositorTokenAccount,
          vault: vaultPDA,
          vaultTokenAccount: vaultTokenAccount,
          position: positionPDA,
          whitelist: whitelistPDA,
          kaminoAccount: admin.publicKey,
          marginfiAccount: admin.publicKey,
          driftAccount: admin.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([depositor])
        .rpc();

      const positionAcc = await program.account.position.fetch(positionPDA);
      expect(positionAcc.amount.toString()).to.equal(amount.toString());
    });
  });

  describe("withdraw", () => {
    it("Fails if liquidity reserve is insufficient", async () => {
        // Vault token account only has 1,000. Try to withdraw 2,000.
        try {
            await program.methods
                .withdraw(new anchor.BN(2000_000_000))
                .accounts({
                    depositor: depositor.publicKey,
                    depositorTokenAccount: depositorTokenAccount,
                    vault: vaultPDA,
                    vaultTokenAccount: vaultTokenAccount,
                    position: positionPDA,
                    mandate: mandatePDA,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .signers([depositor])
                .rpc();
            expect.fail("Should have failed");
        } catch (e) {
            expect(e.toString()).to.include("InsufficientFunds");
        }
    });

    it("Withdraws 500 USDC successfully", async () => {
        const amount = new anchor.BN(500_000_000);
        await program.methods
            .withdraw(amount)
            .accounts({
                depositor: depositor.publicKey,
                depositorTokenAccount: depositorTokenAccount,
                vault: vaultPDA,
                vaultTokenAccount: vaultTokenAccount,
                position: positionPDA,
                mandate: mandatePDA,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([depositor])
            .rpc();
        
        const positionAcc = await program.account.position.fetch(positionPDA);
        // Should be exactly 500 (ignoring mock yield for a few seconds)
        expect(positionAcc.amount.toNumber()).to.be.closeTo(500_000_000, 1000);
    });
  });

  describe("rebalance", () => {
    it("Shifts allocation if Marginfi APY is higher", async () => {
      await program.methods
        .rebalance()
        .accounts({
            authority: admin.publicKey,
            vault: vaultPDA,
            mandate: mandatePDA,
            oracle: admin.publicKey, // Mock
        })
        .rpc();
      
      const vaultAcc = await program.account.vault.fetch(vaultPDA);
      // Started at 80/20. Rebalance logic shifts 10%. Expected 70/30.
      expect(vaultAcc.kaminoAlloc).to.equal(7000);
      expect(vaultAcc.marginfiAlloc).to.equal(3000);
    });
  });

  describe("update_mandate", () => {
    it("Rejects liquidity reserve below 10%", async () => {
        try {
            await program.methods
                .updateMandate(500, 9000, 500) // 5% reserve
                .accounts({
                    admin: admin.publicKey,
                    vault: vaultPDA,
                    mandate: mandatePDA,
                })
                .rpc();
            expect.fail("Should have failed");
        } catch (e) {
            expect(e.toString()).to.include("InvalidMandate");
        }
    });

    it("Updates mandate successfully", async () => {
        await program.methods
            .updateMandate(2000, 7000, 300)
            .accounts({
                admin: admin.publicKey,
                vault: vaultPDA,
                mandate: mandatePDA,
            })
            .rpc();
        
        const mandateAcc = await program.account.mandate.fetch(mandatePDA);
        expect(mandateAcc.minLiquidityReserveBps).to.equal(2000);
    });
  });
});
