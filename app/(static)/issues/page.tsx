import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Playback & Ads Help",
  description:
    "Troubleshooting guide for ads and video playback on CourtSide.",
  alternates: { canonical: "/issues" },
};

export default function IssuesPage() {
  return (
    <div className="space-y-8 text-ink-300">
      <section className="space-y-4">
        <h1 className="text-2xl font-black tracking-tight text-ink-100 sm:text-3xl">
          <span aria-hidden="true">&#128737;&#65039; </span>
          Having Issues With Ads or Video Playback?
        </h1>
        <p>
          For a smoother browsing experience, we recommend using Brave Browser,
          especially on Android and Windows.
        </p>
        <p>
          <strong className="text-ink-100">Important:</strong> VPN or DNS
          settings are not required for ad blocking. Use Brave&apos;s built-in ad
          blocker for ads.
        </p>
        <p>
          VPN/DNS settings are only recommended if the video is not loading or
          playback is not working.
        </p>
      </section>

      <hr className="border-surface-600" />

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink-100">
          <span aria-hidden="true">&#128737;&#65039; </span>1. For Blocking Ads
        </h2>
        <p>
          If you&apos;re seeing too many advertisements, use Brave&apos;s built-in
          Shields/ad blocker.
        </p>
        <h3 className="text-lg font-bold text-ink-100">
          Recommended settings
        </h3>
        <p className="font-semibold text-ink-100">Brave Shields → ON</p>
        <p className="font-semibold text-ink-100">
          Trackers &amp; ads blocking&nbsp; if it still show the ads use
          aggressive mode.
        </p>
        <Image
          src="/issues/brave-shields-windows.png"
          alt="Brave desktop Shields settings with aggressive ad blocking highlighted"
          width={1126}
          height={800}
          className="h-auto w-full"
        />
        <p>You do NOT need to use a VPN or change your DNS just to block ads.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink-100">
          <span aria-hidden="true">&#128241; </span>2. Android — Brave Setup
        </h2>
        <h3 className="text-lg font-bold text-ink-100">Step 1 — Install Brave</h3>
        <p>
          Install and open Brave Browser, then visit the website through Brave.
        </p>
        <h3 className="text-lg font-bold text-ink-100">
          Step 2 — Turn ON Shields
        </h3>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Open the website in Brave.</li>
          <li>Go to setting and choose brave shield and privacy</li>
          <li>Set Trackers &amp; ads blocking to Aggressive, if available.</li>
        </ol>
        <Image
          src="/issues/brave-shields-android.png"
          alt="Brave Android Shields and privacy settings with aggressive blocking highlighted"
          width={383}
          height={853}
          className="mx-auto h-auto max-w-full"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink-100">
          <span aria-hidden="true">&#127909; </span>3. Video Not Working?
        </h2>
        <p>If the video is already working normally, STOP HERE.</p>
        <p>You do not need to change your DNS or use a VPN.</p>
        <p>Only continue with the following steps if:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>The video doesn&apos;t load</li>
          <li>The video doesn&apos;t play</li>
          <li>The video keeps buffering</li>
          <li>You are experiencing a connection/playback problem</li>
        </ul>
        <h3 className="text-lg font-bold text-ink-100">
          Step 1 — Refresh the Page
        </h3>
        <p>
          First, simply refresh the website and try playing the video again.
        </p>
        <h3 className="text-lg font-bold text-ink-100">
          Step 2 — Check Brave Shields
        </h3>
        <p>
          If the video still doesn&apos;t work:
          <br />
          Shields icon → Turn Shields OFF for this website → Refresh
        </p>
        <p>
          If the video starts working, Brave&apos;s blocking settings may have been
          interfering with the video player.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink-100">
          <span aria-hidden="true">&#127760; </span>4. Try Cloudflare 1.1.1.1 DNS
        </h2>
        <p>Only use this step if the video is still not working.</p>
        <h3 className="text-lg font-bold text-ink-100">Android</h3>
        <p>Go to:</p>
        <p className="font-semibold text-ink-100">
          Brave Settings
          <br />
          → Brave Shields &amp; privacy
          <br />
          → scroll down and choose Use secure DNS
          <br />
          → Another provider → Cloudflare (1.1.1.1)
        </p>
        <p>Then return to the website and refresh the page.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink-100">
          <span aria-hidden="true">&#128187; </span>5. Windows — Brave Setup
        </h2>
        <h3 className="text-lg font-bold text-ink-100">Enable Shields</h3>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Open Brave Browser.</li>
          <li>Click the Shields icon in the address bar.</li>
          <li>Make sure Shields are ON.</li>
          <li>Set Trackers &amp; ads blocking → Aggressive, if available.</li>
        </ol>
        <h3 className="text-lg font-bold text-ink-100">Enable Secure DNS</h3>
        <p>Only do this if your video is not working.</p>
        <p>Go to:</p>
        <p className="font-semibold text-ink-100">
          Brave Settings
          <br />
          → Privacy and security
          <br />
          → Security
          <br />
          → Use secure DNS → Cloudflare (1.1.1.1)
        </p>
        <Image
          src="/issues/brave-secure-dns.png"
          alt="Brave desktop secure DNS settings with Cloudflare selected"
          width={1050}
          height={795}
          className="h-auto w-full"
        />
        <p>Then refresh the website.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink-100">
          <span aria-hidden="true">&#128272; </span>6. Still Can&apos;t Play the Video? Try WARP vpn
        </h2>
        <p>
          If the video still isn&apos;t working after trying the steps above, you can
          optionally try Cloudflare WARP.
        </p>
        <p>
          <strong className="text-ink-100">Important:</strong>
        </p>
        <p>You don&apos;t need WARP if your video is already working.</p>
        <p>
          WARP is only an additional troubleshooting option for connection or
          playback problems.
        </p>
        <p>1.1.1.1 DNS and WARP are not exactly the same thing:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>1.1.1.1 DNS → Changes the DNS resolver.</li>
          <li>WARP → Routes your connection through Cloudflare&apos;s network.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink-100">
          <span aria-hidden="true">&#127822; </span>7. iPhone / iPad / Mac
        </h2>
        <p>
          Brave works on Apple devices, but some features may work differently
          compared with Android and Windows. Because of Apple platform
          limitations, some of the settings or troubleshooting steps in this
          guide may not work on Apple devices.
        </p>
        <h3 className="text-lg font-bold text-ink-100">For Ads</h3>
        <p>Use:</p>
        <p className="font-semibold text-ink-100">Brave Shields / Ad Blocker</p>
        <p>You don&apos;t need a VPN or DNS just to block ads.</p>
        <h3 className="text-lg font-bold text-ink-100">For Video Problems</h3>
        <p>If the video is not working:</p>
        <p className="font-semibold text-ink-100">
          Shields → Adjust blocking settings → Refresh
        </p>
        <p>
          If the problem continues, you can try a compatible 1.1.1.1 DNS or WARP
          setup.
        </p>
        <p>
          Some options may not be available or may appear differently on iPhone,
          iPad, or Mac.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink-100">Quick Guide</h2>
        <h3 className="text-lg font-bold text-ink-100">
          <span aria-hidden="true">&#128737;&#65039; </span>Want to block ads?
        </h3>
        <p>Use Brave Shields / Ad Blocker.</p>
        <p>❌ No VPN required</p>
        <p>❌ No DNS change required</p>
        <h3 className="text-lg font-bold text-ink-100">
          <span aria-hidden="true">&#127909; </span>Video working normally?
        </h3>
        <p>Don&apos;t change anything.</p>
        <p>✅ Keep using Brave normally.</p>
        <h3 className="text-lg font-bold text-ink-100">
          ❌ Video not working?
        </h3>
        <p>Try these steps in order:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Refresh the page</li>
          <li>Check Brave Shields</li>
          <li>Temporarily disable Shields for the website</li>
          <li>Try Cloudflare 1.1.1.1 DNS</li>
          <li>Try Cloudflare WARP</li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink-100">Recommended Setup</h2>
        <p>
          For normal browsing and ads:
          <br />
          <span aria-hidden="true">&#128737;&#65039; </span>Brave + Shields ON
        </p>
        <p>
          For video playback problems only:
          <br />
          <span aria-hidden="true">&#127909; </span>Troubleshoot → DNS → WARP
        </p>
        <p>
          Remember: If everything is already working, there is no need to
          change your DNS or use a VPN.
        </p>
      </section>
    </div>
  );
}
