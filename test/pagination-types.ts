import { expectTypeOf } from 'expect-type'
import type Manage from '../src/Manage'
import type { CommonParameters } from '../src/ManageAPI'
import type { ServiceAPI, Ticket as ManageTicket } from '../src/Manage/ServiceAPI'
import type { PatchOperation } from '../src/types'

type SimpleTicket = { id: number; summary: string }
type TicketParams = { conditions?: string; page?: number; pageSize?: number }

declare const paginate: Manage['paginate']
declare const getTickets: (params: TicketParams) => Promise<SimpleTicket[]>

const tickets = paginate(getTickets, { pageSize: 100 }, { conditions: 'closedFlag = false' })

expectTypeOf(tickets).toEqualTypeOf<Promise<SimpleTicket[]>>()

// @ts-expect-error paginate should preserve the API method argument types.
paginate(getTickets, { pageSize: 100 }, { invalid: true })

declare const serviceApi: ServiceAPI

const serviceTickets = serviceApi.getServiceTickets({
  fields: ['id', 'summary', 'company/id'],
  orderBy: [
    { field: 'company/id', direction: 'asc' },
    { field: 'summary', direction: 'desc' },
  ],
})

expectTypeOf(serviceTickets).toEqualTypeOf<Promise<ManageTicket[]>>()

const ticketParams: CommonParameters<ManageTicket> = {
  fields: ['id', 'company/id'],
  orderBy: [{ field: 'summary', direction: 'asc' }],
}

expectTypeOf(ticketParams).toEqualTypeOf<CommonParameters<ManageTicket>>()

// @ts-expect-error fields should be constrained to Ticket field paths.
serviceApi.getServiceTickets({ fields: ['notAField'] })

// @ts-expect-error nested fields should be constrained to valid nested paths.
serviceApi.getServiceTickets({ fields: ['company/notAField'] })

// @ts-expect-error orderBy fields should be constrained to Ticket field paths.
serviceApi.getServiceTickets({ orderBy: [{ field: 'notAField', direction: 'asc' }] })

// @ts-expect-error orderBy direction should be constrained to asc or desc.
serviceApi.getServiceTickets({ orderBy: [{ field: 'summary', direction: 'ascending' }] })

const addPatchOperation: PatchOperation = { op: 'add', path: 'summary', value: 'updated' }
const replacePatchOperation: PatchOperation = { op: 'replace', path: 'summary', value: 'updated' }
const removePatchOperation: PatchOperation = { op: 'remove', path: 'summary' }

expectTypeOf(addPatchOperation.value).toEqualTypeOf<unknown>()
expectTypeOf(replacePatchOperation.value).toEqualTypeOf<unknown>()
expectTypeOf(removePatchOperation.value).toEqualTypeOf<unknown | undefined>()

// @ts-expect-error add operations should require a value.
const addPatchOperationWithoutValue: PatchOperation = { op: 'add', path: 'summary' }

// @ts-expect-error replace operations should require a value.
const replacePatchOperationWithoutValue: PatchOperation = { op: 'replace', path: 'summary' }

// @ts-expect-error patch operation op should be constrained to JSON patch operations.
const invalidPatchOperation: PatchOperation = { op: 'copy', path: 'summary', value: 'updated' }
