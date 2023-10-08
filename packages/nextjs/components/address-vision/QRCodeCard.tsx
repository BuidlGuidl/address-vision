import { QRCodeSVG } from "qrcode.react";
import { Address } from "viem";

export const QRCodeCard = ({ someAddress }: { someAddress: Address }) => {
  return (
    <div className="card w-[370px] md:w-[425px] bg-base-100 shadow-xl">
      <div className="card-body flex items-center justify-center">
        {someAddress ? (
          <>
            <div className="hidden md:block">
              <QRCodeSVG value={someAddress} size={350} />
            </div>
            <div className="block md:hidden">
              <QRCodeSVG value={someAddress} size={250} />
            </div>
          </>
        ) : (
          <div>QR code will appear here</div>
        )}
      </div>
    </div>
  );
};
