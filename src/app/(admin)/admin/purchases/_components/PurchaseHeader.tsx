import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import { sortMenu } from '@/constants/dropdownMenu';
import * as adminOrderService from '@/lib/services/adminOrderService';

type PurchaseHeaderProps = {
  sort: adminOrderService.AdminOrderSort;
  setSort: React.Dispatch<adminOrderService.AdminOrderSort>;
};

export default function PurchaseHeader({ sort, setSort }: PurchaseHeaderProps) {
  return (
    <div className="w-full flex justify-between items-center text-18-bold mb-[40px]">
      <h1>구매 내역 확인</h1>

      <DropdownButton
        value={sort}
        onChange={(value) => setSort(value as adminOrderService.AdminOrderSort)}
        placeholder="정렬"
        listClassName="border border-primary-100"
        containerClassName="border border-primary-100 text-16-regular"
        className="border-0"
      >
        {sortMenu.map(({ label, name }) => (
          <DropdownItem
            key={label}
            value={label}
            className="text-center justify-center text-16-regular"
          >
            {name}
          </DropdownItem>
        ))}
      </DropdownButton>
    </div>
  );
}
