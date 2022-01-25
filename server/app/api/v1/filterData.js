const filterResult = (result, implement, crawlerTaskId = '') => {
  switch (implement) {
    case 'PuppeteerBharatpe':
      console.log('result', result);
      let list = result.data.txns.map(item => {
        return {
          receivedFrom: item.received_from,
          utrId: item.utr,
          vpaId: item.vpa,
          orderId: item.order_id,
          amount: item.amount,
          crawlerTaskId: crawlerTaskId,
          tradeTime: item.txn_date,
          extra: JSON.stringify({ txn_id: item.txn_id, txn_type: item.txn_type, merchant_id: item.merchant_id })
        };
      });
      return {
        list: list || [],
        info: {
          total: result.data.total.txns,
          amount: result.data.total.net_settlement_amount,
          txn_date: result.data.total.txn_date,
          txn_date_end: result.data.total.txn_date_end
        }
      };
    default:
      break;
  }
};
export { filterResult };
