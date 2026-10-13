// _hooks/useCancelPurchaseModal.tsx
import { DeleteConfirmModal } from '@/components/ui/Modal';
import type { MyOrder } from '@/lib/services/orderService';
import { useModal } from '@/providers/ModalProvider';

type UseCancelPurchaseModalProps = {
  onCancel: (orderId: number) => void;
};

export default function useCancelPurchaseModal({
  onCancel,
}: UseCancelPurchaseModalProps): (order: MyOrder) => void {
  const { openModal, closeModal } = useModal();

  return (order: MyOrder): void => {
    const targetName =
      order.totalItemCount > 1
        ? `${order.representativeProductName} 외 ${order.totalItemCount - 1}건`
        : order.representativeProductName;

    openModal(
      <DeleteConfirmModal
        variant="purchaseRequest"
        targetName={targetName}
        onConfirm={() => {
          onCancel(order.id);
          closeModal();
        }}
      />,
    );
  };
}
