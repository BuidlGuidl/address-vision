import { QRCodeSVG } from "qrcode.react";
import { Address } from "viem";

export const QRCodeCard = ({ someAddress }: { someAddress: Address }) => {
  return (
    <div className="card w-[425px] bg-base-100 shadow-xl">
      <div className="card-body flex justify-center items-center ">
        {someAddress ? (
          <div className="flex flex-col">
            <QRCodeSVG value={someAddress} size={350} />
          </div>
        ) : (
          <div>QR code will appear here</div>
        )}
      </div>
    </div>
  );
};
