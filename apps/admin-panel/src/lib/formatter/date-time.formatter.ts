/**  Automatically convert from UTC to Local (for me it's +7 [Jakarta]) */
const defaultDateTimeFormatter = new Intl.DateTimeFormat('id', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	timeZone: 'Asia/Jakarta',
	hour12: false
})

const dateTimeFormatterWithoutSeconds = new Intl.DateTimeFormat('id', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'Asia/Jakarta',
	hour12: false
})

const shortDateTimeFormatter = new Intl.DateTimeFormat('id', {
	day: 'numeric',
	month: 'short',
	timeZone: 'Asia/Jakarta'
})

export { dateTimeFormatterWithoutSeconds, defaultDateTimeFormatter, shortDateTimeFormatter }
