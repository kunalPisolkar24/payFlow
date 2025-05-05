import { TransferForm } from "./transfer-form";
import { WalletCard } from "./wallet";

export const TransferPage: React.FC = () => {
  return (
    <div className="flex w-full flex-col lg:flex-row lg:justify-between gap-6 p-4 md:p-6 lg:p-8">
      <div className="w-full lg:flex-1 lg:max-w-3xl">
        <TransferForm />
      </div>
      <div className="w-full lg:w-[500px] lg:flex-shrink-0"> 
        <WalletCard />
      </div>
    </div>
  );
};