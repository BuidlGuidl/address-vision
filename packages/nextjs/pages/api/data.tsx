import { Client } from "@covalenthq/client-sdk";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  message?: string;
  data?: any;
};
const COVALENT_TOKEN = process.env.NEXT_PUBLIC_COVALENT_TOKEN as string;

const calculateTotalGasSpent = (transactionData: any) => {
  let totalGasSpentUSD = 0;

  for (const tx of transactionData) {
    totalGasSpentUSD += tx.gas_quote;
  }

  return totalGasSpentUSD.toFixed(2);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const client = new Client(COVALENT_TOKEN);
  if (req.method === "POST") {
    const { address, chainName } = req.body;

    try {
      const data = [] as any;
      for await (const resp of client.TransactionService.getAllTransactionsForAddress(chainName, address)) {
        if (data.length === 100) {
          break;
        }
        data.push(resp);
      }

      const gasUsed = calculateTotalGasSpent(data);

      return res.status(200).json({ message: "success", data: { txCount: data.length, gasUsed } });
    } catch (error: any) {
      console.log(`n-🔴 => handler => error:`, error);
      return res.status(400).json({ message: "error" });
    }
  }

  return res.status(200).json({ message: "success" });
}
