import { useEffect, useState } from "react";
import { Client, NftTokenContractBalanceItem } from "@covalenthq/client-sdk";
import { format } from "date-fns";
import { utils } from "ethers";
import type { NextPage } from "next";
import QRCode from "qrcode.react";
import Select from "react-select";
import { MetaHeader } from "~~/components/MetaHeader";
import { AddressInput } from "~~/components/scaffold-eth";

const COVALENT_TOKEN = process.env.NEXT_PUBLIC_COVALENT_TOKEN as string;

const Home: NextPage = () => {
  const [chains, setChains] = useState<any[]>([]);
  const [selectedChains, setSelectedChains] = useState<any[]>([]);
  const [client, setClient] = useState<Client>();
  const [userAddress, setUserAddress] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(-1);
  const [tokenData, setTokenData] = useState<any>(undefined);
  const [nftData, setNftData] = useState<NftTokenContractBalanceItem[]>(undefined as any);

  const [isLoadingNfts, setIsLoadingNfts] = useState<boolean>(false);

  const loadChains = async () => {
    const client = new Client(COVALENT_TOKEN);
    setClient(client);
    const resp = await client.BaseService.getAllChains();
    // mock data
    // const resp = {
    //   data: {
    //     items: [
    //       {
    //         name: "eth-mainnet",
    //         chain_id: "1",
    //         is_testnet: false,
    //         db_schema_name: "chain_eth_mainnet",
    //         label: "Ethereum Mainnet",
    //         category_label: "Ethereum",
    //         logo_url: "https://www.datocms-assets.com/86369/1669653891-eth.svg",
    //         black_logo_url: "https://www.datocms-assets.com/86369/1669619544-ethereum.png",
    //         white_logo_url: "https://www.datocms-assets.com/86369/1669619533-ethereum.png",
    //         is_appchain: false,
    //         appchain_of: null,
    //       },

    //       {
    //         name: "eth-sepolia",
    //         chain_id: "11155111",
    //         is_testnet: true,
    //         db_schema_name: "chain_eth_sepolia",
    //         label: "Ethereum Sepolia Testnet",
    //         category_label: "Ethereum",
    //         logo_url: "https://www.datocms-assets.com/86369/1669653891-eth.svg",
    //         black_logo_url: "https://www.datocms-assets.com/86369/1669619544-ethereum.png",
    //         white_logo_url: "https://www.datocms-assets.com/86369/1669619533-ethereum.png",
    //         is_appchain: false,
    //         appchain_of: null,
    //       },

    //       {
    //         name: "eth-goerli",
    //         chain_id: "5",
    //         is_testnet: true,
    //         db_schema_name: "chain_eth_goerli",
    //         label: "Ethereum Goerli Testnet",
    //         category_label: "Ethereum",
    //         logo_url: "https://www.datocms-assets.com/86369/1669653891-eth.svg",
    //         black_logo_url: "https://www.datocms-assets.com/86369/1669619544-ethereum.png",
    //         white_logo_url: "https://www.datocms-assets.com/86369/1669619533-ethereum.png",
    //         is_appchain: false,
    //         appchain_of: null,
    //       },
    //     ],
    //   },
    // };
    if (resp.data) {
      const chainItems = resp.data.items;
      const chains: any[] = [];
      for (const { label, chain_id, name } of chainItems) {
        chains.push({ value: name, label, chain_id });
      }

      setChains([...chains]);
    }
  };

  const getAddressBalance = async (activeTab: number) => {
    if (client) {
      const chainName = selectedChains.length > 0 ? selectedChains[activeTab].value : "eth-mainnet";
      const resp = await client.BalanceService.getTokenBalancesForWalletAddress(chainName, userAddress, {
        quoteCurrency: "USD",
      });

      if (resp.error_code === 400) {
        setTokenData([]);
      }
      if (resp.data) {
        const items = resp.data.items.filter(item => Boolean(item.quote) !== false);
        setTokenData([...items]);
      }
    }
  };

  const getNftData = async (activeTab: number) => {
    if (client) {
      setIsLoadingNfts(true);
      const chainName = selectedChains.length > 0 ? selectedChains[activeTab].value : "eth-mainnet";
      const resp = await client.NftService.getNftsForAddress(chainName, userAddress);
      if (resp.error_code === 400) {
        setIsLoadingNfts(false);
        setNftData([]);
      }
      if (resp.data) {
        const items = resp.data.items.map(item => {
          //@ts-ignore
          item.nft_data = item.nft_data
            .map(nftItem => {
              if (nftItem.external_data !== null) {
                return nftItem;
              }
            })
            .filter(nftItem => Boolean(nftItem?.external_data));

          return item;
        });
        setIsLoadingNfts(false);
        setNftData([...items]);
      }
    }
  };

  useEffect(() => {
    loadChains();
  }, []);

  useEffect(() => {
    if (activeTab !== -1) {
      getAddressBalance(activeTab);
      getNftData(activeTab);
    } else {
      setNftData(undefined as any);
      setTokenData(undefined);
    }
  }, [activeTab]);

  useEffect(() => {
    if (utils.isAddress(userAddress)) {
      setSelectedChains([
        {
          chain_id: "1",
          label: "Ethereum Mainnet",
          value: "eth-mainnet",
        },
      ]);
      setActiveTab(0);
      getAddressBalance(0);
      getNftData(0);
    }
  }, [userAddress]);

  if (COVALENT_TOKEN === undefined) {
    return (
      <div className="flex items-center flex-col flex-grow pt-5 ">
        <span className="alert alert-error w-[50%]">Please add covalent api key</span>
      </div>
    );
  }

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-5 ">
        <div className="m-2">
          <AddressInput
            placeholder="Enter address"
            value={userAddress}
            onChange={value => {
              setUserAddress(value);
            }}
          />
        </div>

        <div className="w-[100%] flex justify-end items-center ">
          <div className="w--[50%] ml-auto m-2">
            <div>{utils.isAddress(userAddress) && <QRCode value={"0xAFFA9D3B59E4dF3e7F7F4DD711CCc55C8e6237da"} />}</div>
          </div>
          <div className="w-[50%] mr-[25%]">
            {chains.length > 0 && (
              <Select
                key={utils.isAddress(userAddress) ? userAddress : ""}
                options={chains}
                defaultValue={utils.isAddress(userAddress) ? chains[0] : ""}
                isMulti
                className="w--[50%]"
                placeholder="Select chain"
                onChange={value => {
                  setSelectedChains(value as any);
                  setActiveTab(value.length - 1);
                }}
                isDisabled={!utils.isAddress(userAddress)}
              />
            )}

            {utils.isAddress(userAddress) && (
              <div className="flex flex-col items-center">
                <div>
                  <span className="text-gray-400 text-xs">Also available here</span>
                </div>
                <div className="m-2">
                  <button
                    className="badge badge-sm badge-primary badge-outline mr-2"
                    onClick={() => {
                      window.open("https://etherscan.io/address/" + userAddress + "", "_blank");
                    }}
                  >
                    Etherscan
                  </button>
                  <button
                    className="badge badge-sm badge-primary badge-outline mr-2"
                    onClick={() => {
                      window.open("https://blockscan.com/address/" + userAddress + "", "_blank");
                    }}
                  >
                    Blockscan
                  </button>

                  <button
                    className="badge badge-sm badge-primary badge-outline mr-2"
                    onClick={() => {
                      window.open("https://optimistic.etherscan.io/address/" + userAddress + "", "_blank");
                    }}
                  >
                    Op Etherscan
                  </button>

                  <button
                    className="badge badge-sm badge-primary badge-outline mr-2"
                    onClick={() => {
                      window.open("https://optimistic.etherscan.io/address/" + userAddress + "", "_blank");
                    }}
                  >
                    Optimistic Etherscan
                  </button>

                  <button
                    className="badge badge-sm badge-primary badge-outline mr-2"
                    onClick={() => {
                      window.open("https://app.zerion.io/" + userAddress + "/overview", "_blank");
                    }}
                  >
                    Zerion
                  </button>

                  <button
                    className="badge badge-sm badge-primary badge-outline mr-2"
                    onClick={() => {
                      window.open("https://zapper.xyz/account/" + userAddress + "", "_blank");
                    }}
                  >
                    Zapper
                  </button>

                  <button
                    className="badge badge-sm badge-primary badge-outline mr-2"
                    onClick={() => {
                      window.open("https://app.safe.global/transactions/queue?safe=eth:" + userAddress + "", "_blank");
                    }}
                  >
                    Safe
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoadingNfts && <span className="loading loading-infinity loading-lg"></span>}

        {/* chain tabs */}
        <div className="tabs mr-auto m-5">
          {selectedChains.map((item, index) => {
            return (
              <div key={index} className="">
                <a
                  className={`tab tab-lifted  ${activeTab === index ? "tab-active" : ""}`}
                  onClick={() => {
                    setActiveTab(index);
                  }}
                >
                  {item.label}
                </a>
              </div>
            );
          })}
        </div>

        <div className="flex justify-evenly w-[100%] ">
          {tokenData !== undefined && (
            <div className="flex flex-col items-center w-[50%]">
              <div className="badge badge-primary">Tokens</div>
              <div className="m-5 flex flex-wrap">
                {tokenData &&
                  tokenData.map((item: any) => {
                    return (
                      <div key={item.contract_name} className="m-2">
                        <div className="stats shadow">
                          <div className="stat">
                            <div className="stat-title flex justify-around">
                              <span>{item.contract_name}</span>

                              <span className="ml-auto">
                                <div className="avatar">
                                  <div className="w-7 rounded-full ring ring-1 ring-offset-base-100 ring-offset-2">
                                    <img src={item.logo_url} />
                                  </div>
                                </div>
                              </span>
                            </div>
                            <div className="stat-value">{item.pretty_quote}</div>
                            <div className="stat-desc">
                              <div>{item.type}</div>
                              <div>
                                {item.last_transferred_at !== null && format(item.last_transferred_at, "MMMM d, yyyy")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {tokenData && tokenData.length === 0 && (
                <div className="alert alert-warning">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>No tokens found for this address</span>
                </div>
              )}
            </div>
          )}

          <div className="divider divider-horizontal"></div>

          {nftData && (
            <div className="flex flex-col items-center w-[50%]">
              <div className="badge badge-primary">NFT</div>
              <div className="m-5 flex flex-wrap">
                {nftData &&
                  nftData.length > 0 &&
                  nftData.map(item => {
                    return (
                      <div
                        key={item.contract_address}
                        tabIndex={0}
                        className="collapse collapse-arrow border border-base-300 bg-base-200 m-5"
                      >
                        <div className="collapse-title text-xl font-medium">{item.contract_name}</div>
                        <div className="collapse-content flex flex-col justify-center items-center">
                          {item.nft_data.map(nftItem => {
                            return (
                              <div key={nftItem.token_id?.toString()} className="card w-96 bg-base-100 shadow-xl m-5">
                                <figure className="px-10 pt-10">
                                  <img
                                    src={
                                      nftItem.external_data && nftItem.external_data.image
                                        ? nftItem.external_data.image
                                        : ""
                                    }
                                    alt={
                                      nftItem.external_data && nftItem.external_data.name
                                        ? nftItem.external_data.name
                                        : ""
                                    }
                                    className="rounded-xl"
                                  />
                                </figure>
                                <div className="card-body items-center text-center">
                                  <h2 className="card-title">
                                    {nftItem.external_data && nftItem.external_data.name
                                      ? nftItem.external_data.name
                                      : ""}
                                  </h2>
                                  <p>
                                    {nftItem.external_data && nftItem.external_data.description
                                      ? nftItem.external_data.description
                                      : ""}
                                  </p>
                                  <div className="card-actions">
                                    {/* <button className="btn btn-primary">Buy Now</button> */}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {nftData && nftData.length === 0 && (
                <div className="alert alert-warning">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>No nfts found for this address</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
