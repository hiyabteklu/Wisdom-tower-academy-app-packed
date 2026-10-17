package com.wisdomtower.academy.ui.theme

import android.content.Context
import android.webkit.WebView
import androidx.compose.ui.graphics.Color

/**
 * The app background as the rest of the code sees it (plan B2 of docs/PLAN_SOLID_BACKGROUND_OPTIONS.md, reworked
 * 2026-10-17: the 5 options are now blue, black and three soft space looks, see [AppBackgroundOption]).
 *
 * Native screens draw it through [AtmosphereBackground]. Every local-page WebView (notes, flashcards, quiz, question
 * banks, competition exam and review, AI Tutor) calls [webViewColor] and [clearPageBackground].
 *
 * Slice BG1 (2026-10-17): the WebView and its page are TRANSPARENT, the chosen picture is drawn natively behind it.
 * Slice BG-WEB (2026-10-17, owner: "make the background literally everywhere", ONE place for all web pages):
 * [clearPageBackground] also installs a small script that turns every dark navy panel, card, bar, button and strip
 * of the page into see-through glass (see [GLASS_JS]), so no page file needs its own edit and new pages are covered
 * automatically. Accent colours (green, orange, cyan, red) and inline highlights are left alone.
 *
 * Slice BG-BLINK (2026-10-17, owner: "it blinks the solid color on every click"): hypothesis for the cause, two parts.
 * (a) The script re-ran 120 ms AFTER a class change, so a new or changed panel was painted solid for that time.
 * (b) A page with a CSS background transition: after the old glass was lifted to measure the real colour, the
 * measured value was the start of a transition (so nothing was recognised) and, after glass was set again, the
 * panel faded from solid to glass. Fix: the script now runs INSIDE the mutation callback (before the next paint) and
 * finishes background-colour / background-image transitions straight away, before measuring and after applying.
 * Glass strength raised from 5 to 8 percent (owner: glass is too faint on the textured background).
 *
 * Slice BG-LOADING (2026-10-17, owner: "in loading it's black, especially on notes, exams, flashcards"): the page's own
 * dark colour showed from the start of loading until the glass script ran. [hidePageUntilReady] (called from
 * onPageStarted by scripts/patch_backdrop_loading.py) makes the WebView invisible, so the native backdrop shows, and
 * [clearPageBackground] fades it in once the glass script has run (safety reveal after 1.5 s).
 *
 * Slice BG-POPUP (2026-10-17, owner: "pop ups overlap the text behind, dim the background, raise glass"): cause found.
 * The full-screen dark backdrop of a pop-up (for example `.ovl` in competition_exam.html, rgba(2,6,23,.82)) was treated
 * like a page wrapper and made transparent, so nothing dimmed the page, and the pop-up box itself became 8 percent
 * glass, so the text behind showed through it. Now a full-screen FIXED layer that is partly see-through is a scrim: it
 * becomes a 55 percent black dim, and every dark panel inside it becomes a 82 percent navy panel (readable). Normal
 * glass strength raised from 8 to 16 percent. To go back: glass 0.08, remove the scrim / panel branches in the script.
 */
object AppBackdrop {
    /** The plain page colour of the chosen option. Reading it in a composable follows the choice live. */
    val color: Color
        get() = AppBackground.selected.color

    // One style element per page; calling it again updates the same element, and the important flag beats the page's own rule.
    private fun clearPageJs(css: String): String =
        "(function(){var d=document;var s=d.getElementById('wt-appbg');" +
            "if(!s){s=d.createElement('style');s.id='wt-appbg';(d.head||d.documentElement).appendChild(s);}" +
            "s.textContent='" + css + "';})();"

    /**
     * Turns every OPAQUE DARK-BLUE background (computed colour, blue is the strongest channel and nothing above 110,
     * so black, navy and ink-blue; not green, red, orange or cyan) of a block element into white 16 percent glass, and a
     * navy-only gradient into the same glass. A full-screen wrapper becomes transparent instead, EXCEPT a full-screen
     * fixed layer that is partly see-through (a pop-up backdrop): that becomes a dim, and the dark panels inside it
     * become solid-looking navy so their text is readable. Inline elements
     * (highlights, code chips) are skipped. It re-runs (inside the mutation callback, so before the next paint)
     * whenever a class changes or nodes are added, so selected / correct / wrong states keep working: the old inline
     * value is restored before every pass. Background transitions are finished at once so no solid colour fades in.
     * Light (day) pages have no dark-blue fills, so nothing changes there.
     * No dollar sign and no triple quote may appear in this script (Kotlin raw string).
     */
    private const val GLASS_JS = """
(function(){
 if(window.__wtGlass){window.__wtGlass.run();return;}
 var KEY='data-wtg',GLASS='rgba(255,255,255,0.16)',SCRIM='rgba(0,0,0,0.55)',PANEL='rgba(12,20,36,0.82)',timer=null,busy=false;
 function parse(s){var m=s&&s.match(/rgba?\(([^)]+)\)/);if(!m)return null;
  var p=m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat);
  return {r:p[0],g:p[1],b:p[2],a:(p.length>3&&!isNaN(p[3]))?p[3]:1};}
 function navy(c){return !!c&&c.a>=0.6&&c.b>=c.g&&c.b>=c.r&&Math.max(c.r,c.g,c.b)<=110;}
 function settle(){try{var a=document.getAnimations(),i,t;
  for(i=0;i<a.length;i++){t=a[i].transitionProperty;if(t&&t.indexOf('background')===0)a[i].finish();}}catch(err){}}
 function restore(e){var o=e.__wtOrig;
  if(o){e.style.removeProperty('background-color');e.style.removeProperty('background-image');
   if(o.c)e.style.setProperty('background-color',o.c,o.cp);
   if(o.i)e.style.setProperty('background-image',o.i,o.ip);}
  e.removeAttribute(KEY);e.__wtOrig=null;}
 function run(){
  if(busy||!document.body)return;busy=true;
  try{
   var els=document.body.querySelectorAll('*');
   if(els.length>4000){busy=false;return;}
   var i,j,e,cs,bc,bi,r,jobs=[],scrims=[];
   for(i=0;i<els.length;i++){if(els[i].hasAttribute(KEY))restore(els[i]);}
   settle();
   var W=window.innerWidth,H=window.innerHeight;
   for(i=0;i<els.length;i++){
    e=els[i];var tg=e.tagName;
    if(tg==='SCRIPT'||tg==='STYLE'||tg==='IMG'||tg==='CANVAS'||tg==='VIDEO')continue;
    cs=getComputedStyle(e);
    if(cs.display==='inline'||cs.display==='none')continue;
    bc=parse(cs.backgroundColor);bi=cs.backgroundImage;var hit=0;
    if(navy(bc))hit=1;
    else if(bi&&bi.indexOf('gradient(')>-1){
     var cols=bi.match(/rgba?\([^)]+\)/g)||[],ok=cols.length>0,k;
     for(k=0;k<cols.length;k++){if(!navy(parse(cols[k]))){ok=false;break;}}
     if(ok)hit=2;}
    if(!hit)continue;
    r=e.getBoundingClientRect();
    var full=(r.width*r.height>0.6*W*H);
    var scrim=full&&hit===1&&cs.position==='fixed'&&!!bc&&bc.a<1;
    if(scrim)scrims.push(e);
    jobs.push([e,hit,full,scrim]);
   }
   for(i=0;i<jobs.length;i++){
    e=jobs[i][0];
    var inScrim=false;
    if(!jobs[i][3]){for(j=0;j<scrims.length;j++){if(scrims[j]!==e&&scrims[j].contains(e)){inScrim=true;break;}}}
    e.__wtOrig={c:e.style.getPropertyValue('background-color'),cp:e.style.getPropertyPriority('background-color'),
                i:e.style.getPropertyValue('background-image'),ip:e.style.getPropertyPriority('background-image')};
    var col=jobs[i][3]?SCRIM:(jobs[i][2]?'transparent':(inScrim?PANEL:GLASS));
    e.style.setProperty('background-color',col,'important');
    if(jobs[i][1]===2||jobs[i][2])e.style.setProperty('background-image','none','important');
    e.setAttribute(KEY,'1');
   }
   settle();
  }catch(err){}
  busy=false;}
 function sched(){run();clearTimeout(timer);timer=setTimeout(run,150);}
 try{new MutationObserver(sched).observe(document.documentElement,
  {childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(err){}
 window.__wtGlass={run:run};
 run();
})();
"""

    /** Background colour for a WebView that shows a local page: transparent, the native backdrop shows through. */
    @Suppress("UNUSED_PARAMETER")
    fun webViewColor(context: Context): Int = android.graphics.Color.TRANSPARENT

    /**
     * BG-LOADING: call from onPageStarted of a local-page WebView. The page is invisible (the native backdrop shows)
     * until [clearPageBackground] has run the glass script; a safety reveal after 1.5 s covers a page that never finishes.
     */
    fun hidePageUntilReady(view: WebView) {
        view.animate().cancel()
        view.alpha = 0f
        view.postDelayed({ view.animate().alpha(1f).setDuration(140).start() }, 1500)
    }

    /**
     * Call from onPageFinished of a local-page WebView: makes the page itself transparent and turns its dark-blue
     * panels into glass, then fades the page in (see [hidePageUntilReady]). Every caller must have
     * [AtmosphereBackground] behind its WebView (checked 2026-10-17: Notes, Flashcards, Quiz, Competition exam and
     * review, AI Tutor all have it).
     */
    fun clearPageBackground(view: WebView) {
        val css = "html{background:transparent !important}body{background:transparent !important}"
        view.evaluateJavascript(clearPageJs(css), null)
        view.evaluateJavascript(GLASS_JS) {
            view.animate().cancel()
            view.animate().alpha(1f).setDuration(140).start()
        }
    }
}
