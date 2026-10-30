import type { Metadata } from "next";
import Link from "next/link";
import packageLock from "../../../package-lock.json";
import { LocalizedText } from "@/components/site-preferences";

export const metadata: Metadata = {
  title: "Software licenses | Tecsecure",
  description: "Third-party package versions and SPDX license identifiers used by the Tecsecure platform."
};

type LicenseRecord = {
  name: string;
  version: string;
  expression: string;
  development: boolean;
  npmUrl: string;
};

type LockPackageDetails = {
  version?: string;
  license?: string | { type?: string };
  dev?: boolean;
};

function getLicenseRecords(): LicenseRecord[] {
  const packages = packageLock.packages as Record<string, LockPackageDetails>;
  return Object.entries(packages)
    .filter(([packagePath]) => packagePath.startsWith("node_modules/"))
    .map(([packagePath, details]) => {
      const name = packagePath.split("node_modules/").at(-1) ?? packagePath;
      const version = details.version ?? "unknown";
      const license = details.license;
      return {
        name,
        version,
        expression: typeof license === "string"
          ? license
          : license?.type ?? "License not declared in package-lock.json",
        development: Boolean(details.dev),
        npmUrl: `https://www.npmjs.com/package/${name}/v/${version}`
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

function LicenseExpression({ expression }: { expression: string }) {
  if (
    expression === "License not declared in package-lock.json" ||
    expression.toLowerCase().startsWith("see license in ")
  ) {
    return <span>{expression}</span>;
  }
  const tokens = expression.split(/(\s+|\(|\))/);
  let nextTokenIsException = false;
  return tokens.map((token, index) => {
    if (token === "WITH") {
      nextTokenIsException = true;
      return <span key={`${token}-${index}`}>{token}</span>;
    }
    if (!token || /^\s+$/.test(token) || /^[()]$/.test(token) || /^(?:AND|OR)$/.test(token)) {
      return <span key={`${token}-${index}`}>{token}</span>;
    }
    const isException = nextTokenIsException;
    nextTokenIsException = false;
    if (token.startsWith("LicenseRef-")) return <span key={`${token}-${index}`}>{token}</span>;
    const url = `https://spdx.org/licenses/${isException ? "exceptions/" : ""}${encodeURIComponent(token)}.html`;
    return <a className="text-link" href={url} key={`${token}-${index}`} rel="noreferrer" target="_blank">{token}</a>;
  });
}

export default function LicensesPage() {
  const records = getLicenseRecords();
  const groups = new Map<string, LicenseRecord[]>();
  for (const record of records) {
    const packages = groups.get(record.expression) ?? [];
    packages.push(record);
    groups.set(record.expression, packages);
  }

  return (
    <article className="container page-shell legal-page" style={{ maxWidth: 1000 }}>
      <span className="eyebrow">{records.length} <LocalizedText id="licensesPackageCount" /></span>
      <h1 className="page-title"><LocalizedText id="licensesTitle" /></h1>
      <div className="panel-card">
        <p><LocalizedText id="licensesDescription" /></p>
        <p className="legal-notice"><LocalizedText id="licensesNotice" /></p>
        <div className="license-list">
          {[...groups.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([expression, packages]) => (
            <details className="license-group" key={expression}>
              <summary>
                <span><LicenseExpression expression={expression} /></span>
                <small>{packages.length} <LocalizedText id="licensesPackages" /></small>
              </summary>
              <ul>
                {packages.map((record) => (
                  <li key={`${record.name}@${record.version}`}>
                    <a href={record.npmUrl} rel="noreferrer" target="_blank">{record.name}</a>
                    <span> {record.version}</span>
                    <small><LocalizedText id={record.development ? "licensesDevelopment" : "licensesProduction"} /></small>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
        <nav className="legal-related-links" aria-label="Legal documents">
          <Link href="/privacy"><LocalizedText id="privacyPolicy" /></Link>
          <Link href="/terms"><LocalizedText id="termsOfUse" /></Link>
          <Link href="/contact"><LocalizedText id="contact" /></Link>
        </nav>
      </div>
    </article>
  );
}
