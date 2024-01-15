export const exceptions = {
  AUTH: {
    WRONG_PASSWORD: 'Wrong password',
    EMPTY_REFRESH_TOKEN: 'Refresh token cannot be empty',
    INVALID_TOKEN: 'Invalid/Expired token',
    OTP_CODE_EXPIRED: 'Otp code expired',
    WRONG_OTP_CODE: 'Wrong otp code',
    ACTIVATED: 'ACTIVATED',
    UNACTIVATED: 'UNACTIVATED',
  },
  USER: {
    NOT_FOUND: 'User not found',
    DELETED: 'User has been deleted',
    EMAIL_ALREADY_REGISTERED: (email: string) => {
      return `Email ${email} already registered`
    },
    USERNAME_ALREADY_REGISTERED: (username: string) => {
      return `Username ${username} already registered`
    },
  },
  EVENT: {
    NOT_FOUND: 'Event not found',
  },
  TICKET: {
    NOT_FOUND: 'Ticket not found',
    INVALID: 'Invalid event',
    INSUFFICIENT_STOCK: 'Insufficient ticket stock',
    SALES_NOT_YET_OPEN: 'Ticket sales are not yet open',
    SALES_CLOSED: 'Ticket sales have closed',
    DELETE_PUBLISHED_TICKET: 'Cannot delete published ticket',
    DELETE_PURCHASED_TICKET: 'Cannot delete purchased ticket',
  },
  PURCHASE: {
    NOT_FOUND: 'Purchase not found',
    INVALID: 'Invalid ticket',
    TICKET_USED: 'Ticket has been used',
  },
  VALIDATION: {
    CONTAINS_INVALID_JSON: (e: string) => `${e} contains invalid JSON`,
    CONTAINS_INVALID_DATETIME: (e: string) => `${e} contains invalid DateTime`,
  },
  FILE: {
    NOT_FOUND: 'File was not found',
    UPLOAD_FAILED: 'Failed to upload file',
  },
  WITHDRAW: {
    INSUFFICIENT_BALANCE: 'Insufficient balance',
  },
  MAIL: {
    SENDING_FAILED: 'Failed to send email',
  },
}
