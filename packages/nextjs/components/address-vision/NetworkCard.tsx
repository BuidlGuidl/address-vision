import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Address as AddressComp } from "../scaffold-eth";
import { CovalentClient } from "@covalenthq/client-sdk";
import { useDarkMode } from "usehooks-ts";
import { Address, formatEther, isAddress } from "viem";
import { Chain } from "wagmi";

const isValidEnsOrAddress = (name: string) => isAddress(name) || /^[a-z0-9-]+\.eth$/.test(name); // @remind move this to utils

const client = new CovalentClient(process.env.NEXT_PUBLIC_COVALENT_API_KEY as string);

const getChainNameForOpensea = (id: number) => {
  switch (id) {
    case 1:
      return "ethereum";
    case 42161:
      return "arbitrum";
    case 10:
      return "optimism";
    case 8453:
      return "base";
    case 137:
      return "matic";
    default:
      return "ethereum";
  }
};

const getChainNameForCovalent = (id: number) => {
  switch (id) {
    case 1:
      return "eth-mainnet";
    case 42161:
      return "arbitrum-mainnet";
    case 10:
      return "optimism-mainnet";
    case 8453:
      return "base-mainnet";
    case 137:
      return "matic-mainnet";
    default:
      return "eth-mainnet";
  }
};

export const NetworkCard = ({ someAddress, chain }: { someAddress: Address; chain: Chain }) => {
  const [nfts, setNfts] = useState<any[]>([]);
  const [tokenBalances, setTokenBalances] = useState<any[]>([]);
  const { isDarkMode } = useDarkMode();

  const getNfts = async () => {
    const options = {
      method: "GET",
      headers: { accept: "application/json", "x-api-key": process.env.NEXT_PUBLIC_OPENSEA_API_KEY || "default-key" },
    };

    try {
      const response = await fetch(
        `https://api.opensea.io/api/v2/chain/${getChainNameForOpensea(chain.id)}/account/${someAddress}/nfts`,
        options,
      );
      const data = await response.json();

      if (data.nfts && data.nfts.length > 0) {
        const nftData = [];
        for (let i = 0; i < Math.min(10, data.nfts.length); i++) {
          const nft = data.nfts[i];
          console.log(nft);
          if (nft.image_url && nft.identifier !== "0") {
            nftData.push({
              imageUrl: nft.image_url,
              contract: nft.contract,
              identifier: nft.identifier,
            });
          }
        }
        setNfts(nftData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTokens = async () => {
    const res = await client.BalanceService.getTokenBalancesForWalletAddress(
      getChainNameForCovalent(chain.id),
      someAddress,
      {
        nft: false,
        noSpam: true,
      },
    );
    if (res.data && res.data.items) {
      const filteredTokens = res.data.items ? res.data.items.filter(token => token.quote !== 0) : [];
      setTokenBalances(filteredTokens);
    }
  };

  useEffect(() => {
    setNfts([]);
    setTokenBalances([]);
    if (someAddress && isValidEnsOrAddress(someAddress)) {
      getNfts();
      getTokens();
    }
  }, [someAddress]);

  if (someAddress && isValidEnsOrAddress(someAddress)) {
    return (
      <div className="card w-[370px] md:w-[425px] bg-base-100 shadow-xl flex-grow">
        <div className="card-body">
          <h2 className="card-title whitespace-nowrap">
            <AddressComp address={someAddress} /> on {chain.name}
          </h2>
          <h3 className="font-bold">NFTs</h3>
          {nfts.length > 0 ? (
            <div className="relative flex flex-col">
              <div className="carousel carousel-center rounded-box max-w-md space-x-4 bg-secondary p-4">
                {nfts.map((nft, index) => (
                  <div className="carousel-item" key={index}>
                    <a
                      href={`https://opensea.io/assets/${getChainNameForOpensea(chain.id)}/${nft.contract}/${
                        nft.identifier
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-32 w-32 items-center justify-center"
                    >
                      <div className="flex h-full w-full items-center justify-center">
                        <Image
                          src={nft.imageUrl}
                          className="rounded-box h-full w-full object-contain"
                          alt={`NFT ${index}`}
                          width={128}
                          height={128}
                        />
                      </div>
                    </a>
                  </div>
                ))}
              </div>

              <div className="self-end flex gap-2 absolute bottom-[-35px] right-3">
                <p className="text-xs">See more on </p>
                <Link
                  href={`https://opensea.io/${someAddress}`}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex"
                >
                  <Image
                    src={isDarkMode ? "/opensea-logo-light.svg" : "/opensea-logo-dark.svg"}
                    alt="opensea logo"
                    width={70}
                    height={20}
                  />
                </Link>
              </div>
            </div>
          ) : (
            <p>No NFTs found.</p>
          )}
          <h3 className="mt-4 font-bold">Tokens</h3>
          {tokenBalances.length > 0 ? (
            <div className="max-h-48 overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Balance</th>
                    <th>Balance in USD</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenBalances.slice(0, 10).map((token, index) => {
                    return (
                      <tr key={index}>
                        <td>{`${token.contract_name} (${token.contract_ticker_symbol})`}</td>
                        <td>{Number(formatEther(token.balance)).toFixed(2)}</td>
                        <td>≈${token.quote?.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No tokens found.</p>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className="card w-[425px] bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">See someone on ??????????</h2>
          <p>some text</p>
          <div className="card-actions flex items-center justify-end p-4 text-xl">
            Balance: <p>search for an address</p>
          </div>
        </div>
      </div>
    );
  }
};
