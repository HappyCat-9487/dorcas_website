import { PageShell } from "@/components/nav/page-shell";
import { getSiteSetting } from "@/lib/site-settings";

const MAP_EMBED_URL =
  "https://maps.google.com/maps?q=台北市中山區長安東路一段13號&t=&z=17&ie=UTF8&iwloc=&output=embed";

const contactInfo = [
  { label: "公司名稱", value: "多加旅行社有限公司 Dorcas Travel Service Co., Ltd. (Dorcas Travel)" },
  { label: "地址", value: "台北市中山區(104)長安東路一段13號8樓" },
  { label: "代表人", value: "盧華誠" },
  { label: "聯絡人", value: "盧靜如" },
  { label: "客服信箱", value: "jean08361@dorcas-ts.com.tw", isEmail: true },
  { label: "Tel", value: "025-25311110" },
  { label: "Fax", value: "02-25423282" },
  { label: "統一編號", value: "80293252" },
  { label: "交通甲", value: "354500 北1407" },
];

export default async function ContactPage() {
  const bannerUrl = await getSiteSetting("contact_banner_image");

  return (
    <PageShell>
      {/* ── Rounded card container ─────────────────────────────── */}
      <div className="mx-auto my-8 max-w-[1320px] overflow-hidden rounded-[32px] bg-[#d9d9d9] shadow-[inset_0_4px_4px_rgba(0,0,0,0.25)] md:my-12 md:rounded-[50px]">

        {/* Banner with title overlay */}
        <div className="relative h-[200px] overflow-hidden rounded-[32px] md:h-[286px] md:rounded-[50px]">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Contact us banner"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[#b87a5a]" />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/20">
            <p className="text-[32px] font-semibold leading-tight text-white drop-shadow-[0_4px_20px_#3830cb] md:text-[44px]">
              聯絡我們
            </p>
            <p className="text-[24px] text-white drop-shadow-[0_4px_20px_#3830cb] md:text-[32px]">
              Contact us
            </p>
          </div>
        </div>

        {/* Info + Map row */}
        <div className="grid gap-8 px-6 py-8 md:grid-cols-[1fr_auto] md:px-10 md:py-10">
          {/* Contact details */}
          <address className="not-italic">
            <dl className="space-y-2 text-[17px] leading-relaxed md:text-[22px]">
              {contactInfo.map(({ label, value, isEmail }) => (
                <div key={label} className="flex flex-wrap gap-x-1.5">
                  <dt className="font-semibold">{label}:</dt>
                  <dd>
                    {isEmail ? (
                      <a
                        href={`mailto:${value}`}
                        className="text-blue-700 underline underline-offset-2"
                      >
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </address>

          {/* Map */}
          <div className="overflow-hidden rounded-2xl md:w-[580px]">
            <iframe
              src={MAP_EMBED_URL}
              title="Dorcas Travel office location"
              className="h-[300px] w-full border-0 md:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
