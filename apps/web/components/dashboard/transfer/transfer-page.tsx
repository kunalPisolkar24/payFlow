import { TransferForm } from "./transfer-form";
import { WalletCard } from "./wallet";

export const TransferPage: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-[70px] p-4 ">
      <TransferForm />
      <div className="w-2 h-5">
      </div>
      <WalletCard />
    </div>
  );
};
