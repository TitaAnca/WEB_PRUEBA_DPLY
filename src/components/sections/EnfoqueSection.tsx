"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import styles from "./EnfoqueSection.module.css";

const METHOD_CARDS = [
  {
    number: "01",
    title: "/ Escuchar lo que no se ve",
    text: "Antes de diseñar, leemos el contexto: lo que la marca dice, lo que calla y lo que necesita ordenar para ser entendida.",
  },
  {
    number: "02",
    title: "/ Quitar ruido",
    text: "No todo lo que existe suma. Detectamos incoherencias, limpiamos excesos y dejamos solo lo que ayuda a construir una identidad más clara.",
  },
  {
    number: "03",
    title: "/ Darle forma al criterio",
    text: "Convertimos la dirección en lenguaje visual: composición, color, tipografía, recursos gráficos, tono y sistema.",
  },
  {
    number: "04",
    title: "/ Sacarlo al mundo",
    text: "La llevamos a web, redes, campañas, piezas comerciales y puntos de contacto reales, para que funcione donde de verdad importa.",
  },
] as const;

const ENFOQUE_PHOTO_SRC = "/assets/Enfoque_EtecéStudio.png";
const MOBILE_STACK_MQ = "(max-width: 613px) and (prefers-reduced-motion: no-preference)";

function cardNavLabel(card: (typeof METHOD_CARDS)[number]) {
  const title = card.title.replace(/^\s*\/\s*/, "");
  return `Volver a la carta ${card.number}: ${title}`;
}

export function EnfoqueSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const activeCardRef = useRef(0);
  const scrollNavRef = useRef<((index: number) => void) | null>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();

      mm.add(
        { motionOK: "(prefers-reduced-motion: no-preference)" },
        (context) => {
          if (!context.conditions?.motionOK) return;

          const q = gsap.utils.selector(root);
          const ease = "power3.out";

          const titleLines = q(`.${styles.enfoqueTitleLine}`);
          if (titleLines.length) {
            gsap.from(titleLines, {
              y: 40,
              opacity: 0,
              duration: 0.9,
              ease,
              stagger: 0.1,
              scrollTrigger: { trigger: root, start: "top 78%" },
            });
          }

          const paragraph = q(`.${styles.enfoqueParagraph}`);
          if (paragraph.length) {
            gsap.from(paragraph, {
              y: 24,
              opacity: 0,
              duration: 0.8,
              ease,
              scrollTrigger: { trigger: paragraph[0], start: "top 88%" },
            });
          }

          const photo = q(`.${styles.photoMedia}`);
          if (photo.length) {
            gsap.fromTo(
              photo,
              { clipPath: "inset(0 100% 0 0)", scale: 1.06 },
              {
                clipPath: "inset(0 0% 0 0)",
                scale: 1,
                duration: 1.15,
                ease,
                scrollTrigger: {
                  trigger: q(`.${styles.enfoqueImageWrapper}`)[0] ?? root,
                  start: "top 82%",
                },
              },
            );
          }

          const cards = q(`.${styles.enfoqueCardsGrid} .${styles.card}`);
          if (cards.length) {
            gsap.from(cards, {
              y: 34,
              opacity: 0,
              duration: 0.85,
              ease,
              stagger: 0.16,
              clearProps: "transform,opacity",
              scrollTrigger: {
                trigger: q(`.${styles.enfoqueCardsGrid}`)[0] ?? root,
                start: "top 85%",
              },
            });
          }
        },
      );

      mm.add(MOBILE_STACK_MQ, () => {
        const q = gsap.utils.selector(root);
        const pinWrap = q(`.${styles.enfoqueCardsPin}`)[0] as
          | HTMLElement
          | undefined;
        const stage = q(`.${styles.enfoqueCardsStage}`)[0] as
          | HTMLElement
          | undefined;
        const cardEls = gsap.utils.toArray<HTMLElement>(
          q(`.${styles.cardMobile}`),
        );

        if (!pinWrap || !stage || cardEls.length !== METHOD_CARDS.length) {
          return;
        }

        const transitions = METHOD_CARDS.length - 1;
        const MOBILE_CARD_GAP = 15;
        const INCOMING_PREVIEW = 24;
        const BOTTOM_SAFETY = 18;
        const SCROLL_VH = 0.62;
        const SCROLL_MIN = 250;
        const SCRUB_SMOOTH = 0.8;
        const MOVE_RATIO = 0.92;
        const SEGMENT_OVERLAP = 0.06;
        const SETTLE_RATIO = 0.02;
        const CLIP_LAG = 0.18;
        const ACTIVE_CARD_LEAD = 0.12;

        type StackMetrics = {
          stackTop: number;
          collapsedHeaderHeights: number[];
          stackStep: number;
          mobileStackGap: number;
          cardHeights: number[];
          stageHeight: number;
          scrollDistance: number;
        };

        const headerClip = (strip: number) =>
          `inset(0px 0px calc(100% - ${strip}px) 0px)`;

        const getCardOffset = (index: number, metrics: StackMetrics) => {
          let offset = metrics.stackTop;
          for (let i = 0; i < index; i += 1) {
            offset +=
              metrics.collapsedHeaderHeights[i] + metrics.mobileStackGap;
          }
          return offset;
        };

        const incomingStartY = (
          activeIndex: number,
          metrics: StackMetrics,
        ) =>
          metrics.cardHeights[activeIndex] -
          metrics.collapsedHeaderHeights[activeIndex];

        const tuckedBelowStageY = (
          cardIndex: number,
          metrics: StackMetrics,
        ) =>
          metrics.stageHeight -
          getCardOffset(cardIndex, metrics) +
          INCOMING_PREVIEW;

        const readStackTop = () => {
          const navEl = document.querySelector(
            '[class*="mobileTopNav"]',
          ) as HTMLElement | null;
          const navBottom = navEl?.getBoundingClientRect().bottom ?? 68;
          return Math.round(Math.max(navBottom + 10, 72));
        };

        const measureCollapsedHeaderHeights = () => {
          const saved = stage.dataset.activeCard ?? "0";
          const heights: number[] = [];

          cardEls.forEach((card, index) => {
            const probeActive =
              index === cardEls.length - 1 ? 0 : index + 1;
            stage.dataset.activeCard = String(probeActive);
            void stage.offsetHeight;

            const strip = card.querySelector(
              `.${styles.cardMobileHeaderStrip}`,
            ) as HTMLElement | null;
            heights.push(
              Math.round(strip?.getBoundingClientRect().height ?? 52),
            );
          });

          stage.dataset.activeCard = saved;
          return heights;
        };

        const measureExpandedCardHeight = (card: HTMLElement) => {
          const body = card.querySelector(
            `.${styles.cardMobileBody}`,
          ) as HTMLElement | null;
          return Math.round(body?.offsetHeight ?? card.offsetHeight);
        };

        const measureCardHeights = () => {
          const savedActive = stage.dataset.activeCard ?? "0";
          const heights: number[] = [];

          cardEls.forEach((card, index) => {
            stage.dataset.activeCard = String(index);

            cardEls.forEach((entry, entryIndex) => {
              const isMeasured = entryIndex === index;
              gsap.set(entry, {
                clearProps: "height,minHeight,maxHeight",
                position: isMeasured ? "relative" : "absolute",
                top: isMeasured ? "auto" : -10000,
                left: isMeasured ? "auto" : 0,
                right: isMeasured ? "auto" : 0,
                width: "100%",
                y: 0,
                scale: 1,
                clipPath: "inset(0px 0px 0px 0px)",
                visibility: isMeasured ? "visible" : "hidden",
              });
            });

            void stage.offsetHeight;
            heights.push(measureExpandedCardHeight(card));
          });

          cardEls.forEach((entry) => {
            gsap.set(entry, { visibility: "visible" });
          });

          stage.dataset.activeCard = savedActive;
          return heights;
        };

        const computeMetrics = (): StackMetrics => {
          const stackTop = readStackTop();
          const collapsedHeaderHeights = measureCollapsedHeaderHeights();
          const stackStep = collapsedHeaderHeights[0] + MOBILE_CARD_GAP;
          const cardHeights = measureCardHeights();

          const layoutBase: StackMetrics = {
            stackTop,
            collapsedHeaderHeights,
            stackStep,
            mobileStackGap: MOBILE_CARD_GAP,
            cardHeights,
            stageHeight: 0,
            scrollDistance: 0,
          };

          const stageHeight = Math.ceil(
            Math.max(
              ...cardHeights.map(
                (height, index) => getCardOffset(index, layoutBase) + height,
              ),
            ) + BOTTOM_SAFETY,
          );

          const scrollDistance =
            Math.max(window.innerHeight * SCROLL_VH, SCROLL_MIN) *
            transitions;

          return {
            stackTop,
            collapsedHeaderHeights,
            stackStep,
            mobileStackGap: MOBILE_CARD_GAP,
            cardHeights,
            stageHeight,
            scrollDistance,
          };
        };

        const applyStackLayout = (metrics: StackMetrics) => {
          stage.style.setProperty(
            "--enfoque-card-stack-gap",
            `${metrics.mobileStackGap}px`,
          );

          gsap.set(stage, {
            height: metrics.stageHeight,
            overflow: "hidden",
            position: "relative",
          });

          cardEls.forEach((card, index) => {
            let startY = 0;
            if (index === 1) {
              startY = incomingStartY(0, metrics);
            } else if (index > 1) {
              startY = tuckedBelowStageY(index, metrics);
            }

            gsap.set(card, {
              clearProps: "height,minHeight,maxHeight",
              position: "absolute",
              left: 0,
              right: 0,
              width: "100%",
              visibility: "visible",
              opacity: 1,
              top: getCardOffset(index, metrics),
              zIndex: 10 + index,
              force3D: true,
              transformOrigin: "top center",
              clipPath: "inset(0px 0px 0px 0px)",
              y: startY,
              scale: index === 0 ? 1 : 0.99,
              boxShadow:
                index === 0
                  ? "0 12px 40px rgba(0,0,0,0.4)"
                  : "0 6px 22px rgba(0,0,0,0.26)",
            });
          });
        };

        const syncActiveCard = (progress: number) => {
          const segment = 1 / transitions;
          const nextActive = Math.min(
            transitions,
            Math.max(0, Math.floor(progress / segment + ACTIVE_CARD_LEAD)),
          );

          if (nextActive !== activeCardRef.current) {
            activeCardRef.current = nextActive;
            stage.dataset.activeCard = String(nextActive);
          }
        };

        let metrics = computeMetrics();

        const ctx = gsap.context(() => {
          applyStackLayout(metrics);
          stage.dataset.activeCard = "0";
          activeCardRef.current = 0;

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              id: "enfoque-mobile-card-stack",
              trigger: pinWrap,
              start: () => `top ${metrics.stackTop}px`,
              end: () => `+=${metrics.scrollDistance}`,
              pin: stage,
              pinSpacing: true,
              scrub: SCRUB_SMOOTH,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onRefresh: () => {
                metrics = computeMetrics();
                applyStackLayout(metrics);
              },
              onUpdate: (self) => {
                syncActiveCard(self.progress);
              },
            },
          });

          const segment = 1 / transitions;

          tl.addLabel("card-01-active", 0);

          for (let index = 0; index < transitions; index += 1) {
            const segStart = index * segment;
            const overlap = index > 0 ? segment * SEGMENT_OVERLAP : 0;
            const moveStart = Math.max(0, segStart - overlap);
            const moveDuration = segment * MOVE_RATIO + overlap;
            const settledAt = moveStart + moveDuration;
            const incoming = cardEls[index + 1];
            const outgoing = cardEls[index];
            const queueTween = segment * 0.1;

            tl.fromTo(
              incoming,
              {
                y: () => incomingStartY(index, metrics),
                scale: 0.99,
              },
              {
                y: 0,
                scale: 1,
                duration: moveDuration,
              },
              moveStart,
            );

            tl.fromTo(
              outgoing,
              {
                clipPath: "inset(0px 0px 0px 0px)",
                scale: 1,
              },
              {
                clipPath: () =>
                  headerClip(metrics.collapsedHeaderHeights[index]),
                scale: 0.992,
                duration: moveDuration * (1 - CLIP_LAG),
              },
              index === 0 ? moveStart : `<${CLIP_LAG * 100}%`,
            );

            tl.addLabel(`card-0${index + 2}-active`, settledAt);

            if (index + 2 < cardEls.length) {
              tl.to(
                cardEls[index + 2],
                {
                  y: () => incomingStartY(index + 1, metrics),
                  duration: queueTween,
                  ease: "none",
                },
                settledAt - segment * 0.08,
              );
            }

            if (index + 3 < cardEls.length) {
              tl.to(
                cardEls[index + 3],
                {
                  y: () => tuckedBelowStageY(index + 3, metrics),
                  duration: queueTween,
                  ease: "none",
                },
                settledAt - segment * 0.05,
              );
            }
          }

          tl.to({}, { duration: segment * SETTLE_RATIO });

          scrollNavRef.current = (cardIndex: number) => {
            const st = tl.scrollTrigger;
            if (!st) return;

            const label = `card-0${cardIndex + 1}-active`;
            const labelTime = tl.labels[label];
            if (labelTime === undefined) return;

            const targetY =
              st.start +
              (labelTime / tl.duration()) * (st.end - st.start);
            const prefersReducedMotion = window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches;

            window.scrollTo({
              top: targetY,
              behavior: prefersReducedMotion ? "auto" : "smooth",
            });
          };
        }, root);

        const refreshStack = () => {
          metrics = computeMetrics();
          applyStackLayout(metrics);
          ScrollTrigger.refresh();
        };

        let resizeTimer: ReturnType<typeof setTimeout> | undefined;
        const onResize = () => {
          if (resizeTimer) clearTimeout(resizeTimer);
          resizeTimer = setTimeout(refreshStack, 200);
        };

        if (document.fonts?.ready) {
          void document.fonts.ready.then(refreshStack);
        }

        window.addEventListener("resize", onResize);

        return () => {
          window.removeEventListener("resize", onResize);
          if (resizeTimer) clearTimeout(resizeTimer);
          scrollNavRef.current = null;
          ctx.revert();
          stage.style.removeProperty("--enfoque-card-stack-gap");
          delete stage.dataset.activeCard;
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef },
  );

  const handleStackNav = (index: number) => {
    scrollNavRef.current?.(index);
  };

  return (
    <section
      ref={sectionRef}
      id="enfoque"
      data-theme="dark"
      className={`landing-block landing-block--enfoque ${styles.enfoque}`}
      aria-label="Enfoque"
    >
      <div className={`${styles.bg} postHeroSafeFrame`} aria-hidden="true">
        <div className={styles.bgStripe} />
        <div className={styles.bgWash} />
        <div className={styles.bgGrain} />
      </div>

      <div className={`${styles.inner} postHeroSafeFrame`}>
        <div className={styles.enfoqueHeader}>
          <h2 className={styles.enfoqueTitleTop}>
            <span className={styles.enfoqueTitleLine}>
              DONDE OTROS VEN{" "}
              <span className={styles.enfoqueAccent}>RUIDO</span>,
            </span>
          </h2>

          <div className={styles.enfoqueLowerLeft}>
            <div className={styles.enfoqueTitleBottom}>
              <span className={styles.enfoqueTitleLine}>
                <span className={styles.enfoqueTitleLowerLead}>
                  NOSOTROS
                  <br className={styles.enfoqueTitleBrDesktop} aria-hidden="true" />
                  {" "}
                  VEMOS
                </span>
                {" "}
                <span className={styles.enfoqueAccent}>SISTEMA</span>.
              </span>
            </div>

            <p className={styles.enfoqueParagraph}>
              No partimos de piezas sueltas, sino de un sistema capaz de unir lo
              que la marca dice, muestra y provoca. Ordenamos el ruido, definimos
              el criterio y convertimos cada decisión visual en una forma
              reconocible de estar en el mundo.
            </p>
          </div>

          <div className={styles.enfoqueImageWrapper}>
            <div className={styles.photoMedia}>
              <img
                src={ENFOQUE_PHOTO_SRC}
                alt="Proceso creativo de Etecé Studio con materiales de identidad visual sobre una mesa de trabajo"
                className={styles.photoImg}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        <div className={styles.enfoqueCardsGrid}>
          {METHOD_CARDS.map((card) => (
            <article key={card.number} className={styles.card}>
              <span className={styles.cardNumber}>{card.number}</span>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardText}>{card.text}</p>
              <span className={styles.cardLine} aria-hidden="true" />
            </article>
          ))}
        </div>

        <div className={styles.enfoqueCardsPin}>
          <div className={styles.enfoqueCardsStage}>
            {METHOD_CARDS.map((card, index) => (
                <article
                  key={`stack-${card.number}`}
                  className={styles.cardMobile}
                  data-card-index={index}
                >
                  <header className={styles.cardMobileHeader}>
                    <div className={styles.cardMobileHeaderStrip}>
                      {index < 3 ? (
                        <button
                          type="button"
                          className={styles.cardMobileHeaderBtn}
                          onClick={() => handleStackNav(index)}
                          aria-label={cardNavLabel(card)}
                        >
                          <span className={styles.cardMobileNumberStacked}>
                            {card.number}
                          </span>
                          <span className={styles.cardMobileTitleStacked}>
                            {card.title}
                          </span>
                        </button>
                      ) : (
                        <div className={styles.cardMobileHeaderInner}>
                          <span className={styles.cardMobileNumberStacked}>
                            {card.number}
                          </span>
                          <span className={styles.cardMobileTitleStacked}>
                            {card.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </header>
                  <div className={styles.cardMobileBody}>
                    <div className={styles.cardMobileActiveLead}>
                      <span className={styles.cardMobileNumberActive}>
                        {card.number}
                      </span>
                      <h3 className={styles.cardMobileTitleActive}>
                        {card.title}
                      </h3>
                    </div>
                    <p className={styles.cardMobileText}>{card.text}</p>
                    <span className={styles.cardMobileLine} aria-hidden="true" />
                  </div>
                </article>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
