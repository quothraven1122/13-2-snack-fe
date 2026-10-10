'use client';
import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button/Button';
import InfoTable from '@/components/ui/Info/InfoTable';
import PurchaseCardListItem from '@/components/ui/Purchase/PurchaseCardListItem';
import { statusBadgeMenu } from '@/constants/badgeMenu';
import { formatDate } from '@/utils/date';

import usePurchase from '../_hooks/usePurchase';

type PurchaseDetailViewProps = {
  id: number;
};

export default function PurchaseDetailView({ id }: PurchaseDetailViewProps) {
  const router = useRouter();
  const { purchaseData, isPending, isError } = usePurchase({ id });

  const productPriceTotal =
    purchaseData?.items.reduce((total, item) => total + item.subtotal, 0) ?? 0;

  useEffect(() => {
    if (isError) {
      /*추후 상세 에러 처리 로직 추가 예정*/
      alert('데이터를 불러오는 중 에러가 났습니다.');
      router.push('/admin/purchases');
    }
  }, [isError, router]);

  return (
    <div className="px-[24px] pb-[24px] lg:w-[1200px] lg:m-auto">
      <h1 className="text-18-bold mb-[30px]">구매 내역 상세</h1>
      <h2 className="text-16-bold text-primary-950 mb-[20px]">
        요청 품목{' '}
        <span className="text-16-regular">
          총 {purchaseData?.items.length}개
        </span>
      </h2>
      <div className="pt-[20px] pb-[30px] px-[20px] shadow-[0_0_6px_0_rgba(0,0,0,0.1)]">
        {purchaseData?.items.map((item, index) => (
          <PurchaseCardListItem
            key={item.productId}
            imageSrc={item.imageUrl}
            imageAlt={`${item.productName} 사진`}
            name={item.productName}
            price={item.priceAtOrder}
            purchaseCount={item.quantity}
            // 첫 화면에 보이는 첫 상품 이미지만 우선 다운로드한다. (보통 이 페이지의 LCP 요소)
            priority={index === 0}
          />
        ))}
        <div className="flex flex-col mt-[20px] gap-[10px]">
          <div className="flex justify-between text-16-bold text-primary-700">
            <p>주문금액</p>
            <p>{productPriceTotal.toLocaleString()}원</p>
          </div>
          <div className="flex justify-between text-16-bold text-primary-700">
            <p>배송비</p>
            <p>3,000원</p>
          </div>
          <div className="flex justify-between text-18-bold text-primary-950 mt-[10px]">
            <p>총 주문금액</p>
            <p>{(productPriceTotal + 3000).toLocaleString()}원</p>
          </div>
        </div>
      </div>
      <div className="w-full mt-[30px]">
        <InfoTable
          title={
            <h2 className="px-[8px] pb-[14px] text-16-extrabold text-primary-950">
              요청 정보
            </h2>
          }
          data={[
            { label: '요청인', value: purchaseData?.requester.name },
            {
              label: '요청 날짜',
              value: formatDate(purchaseData?.createdAt ?? ''),
            },
            {
              label: '요청 메시지',
              value: purchaseData?.requestMessage,

              fullWidth: true,
            },
          ]}
        />
        <InfoTable
          title={
            <h2 className="px-[8px] pb-[14px] text-16-extrabold text-primary-950">
              예산 정보
            </h2>
          }
          data={[
            {
              label: '담당자',
              value: purchaseData?.handler?.name ?? '',
            },
            {
              label: '승인 날짜',
              value: formatDate(purchaseData?.updatedAt ?? ''),
            },
            {
              label: '상태',
              value: statusBadgeMenu.find(
                (menu) => menu.label === purchaseData?.status,
              )?.name,
            },
            {
              label: '결과 메세지',
              value: purchaseData?.responseMessage,
            },
          ]}
        />
      </div>

      <Button
        text="뒤로 가기"
        type="button"
        variant="primary"
        onClick={() => {
          router.push('/admin/purchases');
        }}
        className="my-[50px]"
      />
    </div>
  );
}
