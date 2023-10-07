import { useEffect, useState } from "react";
import { Client, NftTokenContractBalanceItem } from "@covalenthq/client-sdk";
import axios from "axios";
import { format } from "date-fns";
import { utils } from "ethers";
import type { NextPage } from "next";
import QRCode from "qrcode.react";
import Select from "react-select";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ChartBarIcon, PhotoIcon, WalletIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { useGlobalState } from "~~/services/store/store";
import { GRAPH_COLORS } from "~~/utils/constant";

const COVALENT_TOKEN = process.env.NEXT_PUBLIC_COVALENT_TOKEN as string;
const MENUS = {
  tokens: "tokens",
  nfts: "nfts",
  chart: "chart",
};

const transformForRecharts = (rawData: any) => {
  const transformedData = rawData.reduce((acc, curr) => {
    const singleTokenTimeSeries = curr.holdings.map(holdingsItem => {
      // Formatting the date string just a little...
      const dateStr = holdingsItem.timestamp;
      const date = new Date(dateStr);
      const options = {
        day: "numeric",
        month: "short",
      };
      const formattedDate = date.toLocaleDateString("en-US", options);
      return {
        timestamp: formattedDate,
        [curr.contract_ticker_symbol]: holdingsItem.close.quote,
      };
    });
    const newArr = singleTokenTimeSeries.map((item, i) => Object.assign(item, acc[i]));
    return newArr;
  }, []);
  return transformedData;
};

const Home: NextPage = () => {
  const userAddress = useGlobalState(state => state.userAddress);

  const [chains, setChains] = useState<any[]>([]);
  const [selectedChains, setSelectedChains] = useState<any[]>([]);
  const [client, setClient] = useState<Client>();
  // const [userAddress, setUserAddress] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(-1);
  const [activeMenu, setActiveMenu] = useState<string>(MENUS.tokens);
  const [tokenData, setTokenData] = useState<any>(undefined);
  const [nftData, setNftData] = useState<NftTokenContractBalanceItem[]>(undefined as any);
  const [addressStats, setAddressStats] = useState<any>(undefined as any);

  const [chartData, setChartData] = useState<any[]>(undefined as any);
  const [chartKeys, setChartKeys] = useState<any[]>(undefined as any);

  // const [isLoadingNfts, setIsLoadingNfts] = useState<boolean>(false);
  const [isLoadingPortfolioData, setIsLoadingPortfolioData] = useState<boolean>(false);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);

  const loadChains = async () => {
    const client = new Client(COVALENT_TOKEN);
    setClient(client);
    const resp = await client.BaseService.getAllChains();
    // mock data
    // n-temp
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
      // setIsLoadingNfts(true);
      const chainName = selectedChains.length > 0 ? selectedChains[activeTab].value : "eth-mainnet";
      const resp = await client.NftService.getNftsForAddress(chainName, userAddress);
      if (resp.error_code === 400) {
        // setIsLoadingNfts(false);
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
        // setIsLoadingNfts(false);

        const nftItems = [...items].filter(item => item.contract_name !== null);
        setNftData([...nftItems]);

        setAddressStats((prevAddressStats: any) => ({ ...prevAddressStats, nftCount: nftItems.length }));
        // setIsLoadingNfts(false);
      }
    }
  };
  const getPortfolioData = async (activeTab: number) => {
    if (client) {
      setIsLoadingPortfolioData(true);
      const chainName = selectedChains.length > 0 ? selectedChains[activeTab].value : "eth-mainnet";
      const resp = await client.BalanceService.getHistoricalPortfolioForWalletAddress(chainName, userAddress, {
        quoteCurrency: "USD",
      });
      if (resp.error_code === 400) {
      }
      if (resp.data) {
        const rawData = resp.data.items;
        const transformedData = transformForRecharts(rawData);
        const dataKeys = rawData.map(item => item.contract_ticker_symbol);
        setChartKeys(dataKeys as any);
        setChartData(transformedData as any);
        setIsLoadingPortfolioData(false);
      }
    }
  };

  const getAddressStats = async (activeTab: number) => {
    try {
      setIsLoadingStats(true);
      const chainName = selectedChains.length > 0 ? selectedChains[activeTab].value : "eth-mainnet";
      const res = await axios.post(`${window.location.href}api/data`, { address: userAddress, chainName });
      const { data } = res;
      setAddressStats((preAddressStats: any) => ({
        ...preAddressStats,
        txCount: data.data.txCount,
        gasUsed: data.data.gasUsed,
      }));

      setIsLoadingStats(false);
    } catch (error) {}
  };

  useEffect(() => {
    loadChains();
  }, []);

  useEffect(() => {
    if (activeTab !== -1) {
      getAddressBalance(activeTab);
      getNftData(activeTab);
      getPortfolioData(activeTab);
      getAddressStats(activeTab);
    } else {
      setNftData(undefined as any);
      setTokenData(undefined);
      setChartData(undefined as any);
      setAddressStats(undefined as any);
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
      getAddressStats(0);
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
        <div className="w-[100%] flex justify-end items-center ">
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

        {isLoadingStats && <span className="loading loading-infinity loading-lg absolute top-[30%] z-50"></span>}
        {utils.isAddress(userAddress) && addressStats && (
          <div>
            <div className={`stats lg:stats-horizontal shadow w-[100%] ${isLoadingStats ? "blur" : ""}`}>
              {addressStats["gasUsed"] && (
                <div className="stat">
                  <div className="stat-title">Total Gas</div>
                  <div className="stat-value">${addressStats["gasUsed"]}</div>
                  <div className="stat-desc">
                    Last <span className="text text-warning">{addressStats["txCount"]}</span> tx
                  </div>
                </div>
              )}

              <div className="stat">
                {/* <div className="stat-title">QR</div> */}
                <div className="stat-value">
                  <div className="">
                    {utils.isAddress(userAddress) && (
                      <QRCode
                        style={{ width: 100, height: 100 }}
                        value={"0xAFFA9D3B59E4dF3e7F7F4DD711CCc55C8e6237da"}
                      />
                    )}
                  </div>
                </div>
              </div>

              {addressStats["nftCount"] !== undefined && (
                <div className="stat">
                  <div className="stat-title">Total {"NFT's"}</div>
                  <div className="stat-value">{addressStats["nftCount"]}</div>
                </div>
              )}
            </div>
          </div>
        )}

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

        <div className="flex flex-col- items-center justify-start w-[100%] ">
          {activeTab !== -1 && (
            <div className="ml-2 absolute top-80">
              <ul className="menu bg-base-300 lg:menu-horizontal- rounded-box ">
                <li>
                  <a className="tooltip tooltip-right" data-tip="Tokens" onClick={() => setActiveMenu(MENUS.tokens)}>
                    <WalletIcon className="w-5" />
                  </a>
                </li>
                <li>
                  <a className="tooltip tooltip-right" data-tip="Nft's" onClick={() => setActiveMenu(MENUS.nfts)}>
                    <PhotoIcon className="w-5" />
                  </a>
                </li>

                <li>
                  <a className="tooltip tooltip-right" data-tip="Chart" onClick={() => setActiveMenu(MENUS.chart)}>
                    <ChartBarIcon className="w-5" />
                  </a>
                </li>
              </ul>
            </div>
          )}

          {/* TOKEN DATA */}
          {tokenData !== undefined && activeMenu === MENUS.tokens && (
            <div className="flex flex-col items-start w-[100%] ml-20">
              {/* <div className="badge badge-primary">Tokens</div> */}
              <div className="m--5 flex flex-wrap">
                {tokenData &&
                  tokenData.map((item: any) => {
                    return (
                      <div key={item.contract_name} className="mx-4 my-2">
                        <div className="stats shadow w-[110%]">
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
                                {item.last_transferred_at !== null &&
                                  format(new Date(item.last_transferred_at), "MMMM d, yyyy")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {tokenData && tokenData.length === 0 && (
                <div className="alert alert-warning w-[50%] ml-52">
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

          {/* <div className="divider divider-horizontal"></div> */}

          {/* NFT DATA */}
          {nftData && activeMenu === MENUS.nfts && (
            <div className="flex flex-col items-center w-[100%] ml-20">
              <div className=" flex flex-wrap">
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
                <div className="alert alert-warning w-[50%] ml-52">
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

          {/* CHART DATA */}

          {activeMenu === MENUS.chart && (
            <div className="flex flex-col items-center w-[100%]">
              {isLoadingPortfolioData && <span className="loading loading-infinity loading-lg"></span>}
              {chartData && (
                <LineChart
                  width={800}
                  height={500}
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {chartKeys &&
                    chartKeys.map((item, i) => {
                      return (
                        item && (
                          <Line
                            key={item.timestamp}
                            fontSize={1}
                            dataKey={item as any}
                            type="monotone"
                            stroke={GRAPH_COLORS[i]}
                          />
                        )
                      );
                    })}
                </LineChart>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
