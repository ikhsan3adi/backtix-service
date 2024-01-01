export interface TransactionDetail {
  order_id: string
  gross_amount: number
}

export interface ItemDetail {
  id: string
  price: number
  quantity: number
  name: string
  merchant_name: string
}

export interface CustomerDetail {
  first_name: string
  last_name: string
  email: string
}

export interface Transaction {
  transaction_details: TransactionDetail
  credit_card?: { secure: true }
  item_details: ItemDetail[]
  customer_details?: CustomerDetail
  custom_field1?: number
}
