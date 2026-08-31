import prisma from '@/lib/prisma';
import { MessageCircle, Facebook, ExternalLink, Phone } from 'lucide-react';

export default async function ContactPage() {
  const importedContactPage = await prisma.customPage
    .findUnique({
      where: { slug: 'contact-source' },
    })
    .catch(() => null);

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="rounded-[32px] bg-white border border-slate-200/80 shadow-soft px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-center lg:justify-start">
            <div className="flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-[30px] bg-[#dff5ee] shadow-inner">
              <MessageCircle className="h-16 w-16 text-[#0f8d6b] stroke-[1.7]" />
            </div>
          </div>

          <div className="flex-1 text-right">
            <h1 className="text-[clamp(2.2rem,4.2vw,5.3rem)] font-black leading-[0.85] text-slate-900 font-cairo tracking-[-0.05em] whitespace-nowrap">
              {importedContactPage?.title || 'دعم المنصة والتحويلات'}
            </h1>

            <div className="mt-5 space-y-4 text-right">
              <a
                href="tel:+201070130096"
                dir="ltr"
                className="block text-[clamp(1.3rem,2vw,2.5rem)] font-extrabold text-[#f59e0b] hover:text-[#d97706] transition-colors leading-none font-cairo tracking-[-0.04em]"
              >
                Vodafone Cash: 01070130096
              </a>

              <a
                href="tel:+201094034691"
                dir="ltr"
                className="block text-[clamp(1.3rem,2vw,2.5rem)] font-extrabold text-[#f59e0b] hover:text-[#d97706] transition-colors leading-none font-cairo tracking-[-0.04em]"
              >
                تحويل فوري: 01094034691
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact details removed for students per request */}
    </div>
  );
}
