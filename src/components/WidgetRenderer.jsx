// src/components/WidgetRenderer.jsx
import ComposedWidget from "./widgets/ComposedWidget.jsx";
import TravelCardChargeWidget from "./travel/TravelCardChargeWidget.jsx";
import OverseasQrPaymentWidget from "./travel/OverseasQrPaymentWidget.jsx";
import TravelInsuranceWidget from "./travel/TravelInsuranceWidget.jsx";

import GroupAccount from "./widgets/GroupAccount.jsx";
import ExpenseReport from "./widgets/ExpenseReport.jsx";
import CardSafety from "./widgets/CardSafety.jsx";
import StopCard from "./widgets/StopCard.jsx";
import AtmNum from "./widgets/AtmNum.jsx";
import AtmPlace from "./widgets/AtmPlace.jsx";
import AtmDes from "./widgets/AtmDes.jsx";
import Done from "./widgets/Done.jsx";
import ReceiveInfo from "./widgets/ReceiveInfo.jsx";

function WidgetRenderer({ widget, onSheetOpenChanged, values, onValuesChange, onSubmit, busy }) {
  if (widget.id && widget.data_origin) {
    return <ComposedWidget {...{ widget, values, onValuesChange, onSubmit, busy }} />;
  }
  switch (widget.type) {
    case "travel_card_charge_widget":
      return <TravelCardChargeWidget {...widget} onSheetOpenChanged={onSheetOpenChanged} />;

    case "overseas_qr_payment_widget":
      return <OverseasQrPaymentWidget {...widget} onSheetOpenChanged={onSheetOpenChanged} />;

    case "travel_insurance_widget":
      return <TravelInsuranceWidget {...widget} />;

    case "group_account_status":
      return <GroupAccount {...widget} />;

    case "expense_report_widget":
      return <ExpenseReport {...widget} onSheetOpenChanged={onSheetOpenChanged} />;

    case "group_card_safety_widget":
      return <CardSafety {...widget} />;

    case "card_freeze_all":
      return <StopCard {...widget} />;

    case "atm_smart_withdrawal":
      return (
        <div className="flex flex-col gap-3">
          <AtmNum {...widget} />
          <AtmPlace {...widget} />
          <AtmDes {...widget} />
        </div>
      );

    case "id_reissue_status_widget":
      return (
        <div className="flex flex-col gap-3">
          <Done {...widget} />
          <ReceiveInfo {...widget} />
        </div>
      );

    default:
      console.warn("지원하지 않는 위젯 타입:", widget.type);
      return <p role="alert" className="rounded-card bg-white p-4 text-body-2 text-gray">이 금융 기능을 표시할 수 없어요.</p>;
  }
}

export default WidgetRenderer;