/* ============================================================
   Singlo Share Card (Part 7) — 1200x630 canvas, matches app style
   Usage:
     const card = SingloShare.beltCard({ name, belt, xp });
     card.download(); card.tweet();
   `belt` is an entry from Singlo.BELTS.
   ============================================================ */
(function () {
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function blob(ctx, x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(26,26,46,0)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function beltCard({ name, belt, xp, siteUrl = 'singlo.app' }) {
    const W = 1200, H = 630;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');

    // dark app background + neon blobs (same palette as index.html)
    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(0, 0, W, H);
    blob(ctx, 120, 90, 320, '#FF4F91', 0.30);
    blob(ctx, 1080, 540, 300, '#7B61FF', 0.30);
    blob(ctx, 900, 120, 220, '#00C9A7', 0.22);
    blob(ctx, 250, 540, 200, '#FFD93D', 0.18);

    // glass card
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    roundRect(ctx, 70, 60, W - 140, H - 120, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2; ctx.stroke();

    // belt ribbon
    ctx.save();
    ctx.translate(W / 2, 335);
    ctx.rotate(-0.05);
    ctx.fillStyle = belt.color;
    roundRect(ctx, -400, -48, 800, 96, 22);
    ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 64, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 8; ctx.stroke();
    ctx.restore();

    // text
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '800 46px "Nunito", system-ui, sans-serif';
    ctx.fillText(`${name || 'A Singlo singer'} just earned the`, W / 2, 155);

    ctx.font = '80px "Fredoka One", "Baloo 2", system-ui, sans-serif';
    ctx.fillStyle = belt.color;
    ctx.fillText(`${belt.emoji} ${belt.name}`, W / 2, 245);

    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '800 36px "Nunito", system-ui, sans-serif';
    ctx.fillText(`${(xp || 0).toLocaleString()} XP · sing your way up at ${siteUrl}`, W / 2, 480);

    ctx.font = '44px "Fredoka One", "Baloo 2", system-ui, sans-serif';
    ctx.fillStyle = '#FFD93D';
    ctx.fillText('Singlo 🎵', W / 2, 550);

    const dataUrl = c.toDataURL('image/png');
    return {
      dataUrl,
      download(filename = 'singlo-belt.png') {
        const a = document.createElement('a');
        a.href = dataUrl; a.download = filename; a.click();
      },
      tweet(text = `I just earned the ${belt.name} ${belt.emoji} on Singlo! 🎵 https://${siteUrl}`) {
        this.download(); // X intents can't attach images from JS — user attaches the saved card
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank');
      },
    };
  }

  window.SingloShare = { beltCard };
})();
