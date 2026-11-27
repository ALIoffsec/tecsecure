import { prisma } from "./prisma";
import { invoiceSums, requestGroup, waitsOnCustomer, type RequestGroup } from "./customer-requests";

const quoteLines = { select: { id: true, description: true, quantity: true, unitPriceMinor: true, discountMinor: true } } as const;
const invoiceFields = {
  id: true, number: true, status: true, currency: true, dueAt: true, createdAt: true,
  items: { select: { quantity: true, unitPriceMinor: true, taxMinor: true, discountMinor: true } },
  payments: { select: { status: true, amountMinor: true } }
} as const;
const latestQuote = {
  orderBy: { version: "desc" as const }, take: 1,
  select: { id: true, number: true, status: true, validUntil: true, currency: true, items: quoteLines, invoices: { where: { status: { not: "VOID" as const } }, orderBy: { createdAt: "desc" as const }, take: 1, select: invoiceFields } }
};

export type RequestRow = {
  kind: "request" | "project"; id: string; title: string | null; reference: string; badge: { kind: "request" | "project"; code: string };
  changedAt: Date; group: RequestGroup; quoteIssued: boolean; invoiceId: string | null;
};

/** "My requests": every request, and projects that came without one, sorted into the three groups. */
export async function cabinetRequestList(userId: string) {
  const [requests, projects, products, services] = await Promise.all([
    prisma.serviceRequest.findMany({
      where: { customerId: userId }, orderBy: { updatedAt: "desc" }, take: 100,
      select: { id: true, reference: true, status: true, updatedAt: true, service: { select: { name: true } }, project: { select: { status: true, updatedAt: true, quotations: latestQuote } } }
    }),
    prisma.project.findMany({
      where: { customerId: userId, requestId: null }, orderBy: { updatedAt: "desc" }, take: 100,
      select: { id: true, reference: true, name: true, status: true, updatedAt: true, quotations: latestQuote }
    }),
    prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { id: true, name: true } }),
    prisma.service.findMany({ where: { status: "PUBLISHED", availability: true }, select: { id: true, name: true } })
  ]);
  const rows: RequestRow[] = [
    ...requests.map(request => {
      const quote = request.project?.quotations[0] ?? null;
      const invoice = quote?.invoices[0] ?? null;
      const changedAt = request.project && request.project.updatedAt > request.updatedAt ? request.project.updatedAt : request.updatedAt;
      return {
        kind: "request" as const, id: request.id, title: request.service?.name ?? null, reference: request.reference, badge: { kind: "request" as const, code: request.status },
        changedAt, group: requestGroup({ requestStatus: request.status, projectStatus: request.project?.status ?? null, quote, invoice }),
        quoteIssued: quote?.status === "ISSUED", invoiceId: invoice && waitsOnCustomer(null, invoice) ? invoice.id : null
      };
    }),
    ...projects.map(project => {
      const quote = project.quotations[0] ?? null;
      const invoice = quote?.invoices[0] ?? null;
      return {
        kind: "project" as const, id: project.id, title: project.name, reference: project.reference, badge: { kind: "project" as const, code: project.status },
        changedAt: project.updatedAt, group: requestGroup({ requestStatus: null, projectStatus: project.status, quote, invoice }),
        quoteIssued: quote?.status === "ISSUED", invoiceId: invoice && waitsOnCustomer(null, invoice) ? invoice.id : null
      };
    })
  ].sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());
  return {
    rows,
    catalog: [...products.map(item => ({ ...item, kind: "product" as const })), ...services.map(item => ({ ...item, kind: "service" as const }))]
  };
}

const projectDetail = {
  id: true, reference: true, name: true, status: true, notes: true, city: true, createdAt: true,
  quotations: {
    orderBy: { version: "desc" as const },
    select: {
      id: true, number: true, version: true, status: true, currency: true, validUntil: true, assumptions: true, exclusions: true, createdAt: true, items: quoteLines,
      invoices: { where: { status: { not: "VOID" as const } }, orderBy: { createdAt: "desc" as const }, select: invoiceFields }
    }
  }
} as const;

/** One request (or a project without a request) of this buyer, with its quotes and invoice. Null when not theirs. */
export async function cabinetRequestDetail(userId: string, id: string) {
  const request = await prisma.serviceRequest.findFirst({
    where: { id, customerId: userId },
    select: {
      id: true, reference: true, status: true, description: true, city: true, location: true, createdAt: true, service: { select: { name: true } },
      history: { orderBy: { createdAt: "asc" }, select: { id: true, fromStatus: true, toStatus: true, createdAt: true, note: true } },
      project: { select: projectDetail }
    }
  });
  if (request) return { kind: "request" as const, request, project: request.project };
  const project = await prisma.project.findFirst({ where: { id, customerId: userId }, select: projectDetail });
  return project ? { kind: "project" as const, request: null, project } : null;
}

export type CabinetRequestDetail = NonNullable<Awaited<ReturnType<typeof cabinetRequestDetail>>>;

/** A payment invoice for its owner (or staff with PAYMENTS), with what was paid and what is being checked. */
export async function cabinetInvoice(id: string, viewer: { id: string; staff: boolean }) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, ...(viewer.staff ? {} : { quotation: { project: { customerId: viewer.id } } }) },
    select: {
      id: true, number: true, status: true, currency: true, dueAt: true, issuedAt: true, createdAt: true,
      items: { select: { id: true, description: true, quantity: true, unitPriceMinor: true, taxMinor: true, discountMinor: true } },
      payments: { orderBy: { createdAt: "desc" }, select: { id: true, amountMinor: true, method: true, reference: true, status: true, createdAt: true } },
      quotation: { select: { number: true, project: { select: { id: true, name: true, requestId: true } } } }
    }
  });
  if (!invoice) return null;
  return { ...invoice, sums: invoiceSums(invoice) };
}

export type CabinetInvoice = NonNullable<Awaited<ReturnType<typeof cabinetInvoice>>>;
