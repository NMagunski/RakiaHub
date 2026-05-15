import Link from "next/link";

export const metadata = {
  title: "Общи условия — RakiaHub",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-10" style={{ background: "#FBF5EC" }}>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-walnut underline underline-offset-2"
        >
          ← Начало
        </Link>

        <h1 className="mb-2 font-serif text-3xl font-bold text-oak">Общи условия</h1>
        <p className="mb-10 text-sm text-accent">Последна актуализация: май 2026 г.</p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed text-oak">

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-oak">1. Въведение</h2>
            <p>
              RakiaHub е платформа за оценка и споделяне на мнения за ракия и други традиционни
              български спиртни напитки. Услугата е предназначена единствено за лична, нетърговска
              употреба. Използвайки RakiaHub, вие се съгласявате с настоящите Общи условия.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-oak">2. Достъп и възраст</h2>
            <p>
              Достъпът до RakiaHub е разрешен единствено на лица, навършили <strong>18 години</strong>.
              Регистрирайки се в платформата, вие потвърждавате, че отговаряте на това изискване.
              Запазваме си правото да прекратим достъпа при установено нарушение.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-oak">3. Потребителско съдържание</h2>
            <p>
              Вие запазвате правата върху съдържанието, което публикувате — оценки, снимки и коментари.
              Като го публикувате в RakiaHub, предоставяте на платформата безвъзмезден, неизключителен
              лиценз за показването му в рамките на услугата. Ние не продаваме и не споделяме вашите
              данни с трети страни за рекламни цели.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-oak">4. Отговорност</h2>
            <p>
              Оценките и мненията в RakiaHub са субективни и отразяват личните предпочитания на
              потребителите. Платформата не носи отговорност за решения, взети въз основа на
              публикуваното съдържание. Консумацията на алкохол е въпрос на лична преценка и
              отговорност.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-oak">5. Акаунти</h2>
            <p>
              Отговорни сте за поверителността на данните за достъп до акаунта си. Забранено е
              публикуването на обидно, невярно или злонамерено съдържание. Запазваме си правото
              да спрем или изтрием акаунти, нарушаващи настоящите условия, без предизвестие.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-oak">6. Промени в условията</h2>
            <p>
              Може да актуализираме тези условия периодично. При съществена промяна ще уведомим
              потребителите чрез приложението. Продължаването на използването на RakiaHub след
              публикуването на промените означава приемането им.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-oak">7. Контакт</h2>
            <p>
              За въпроси относно тези условия можете да се свържете с нас на:{" "}
              <a
                href="mailto:n.magunski@gmail.com"
                className="font-medium text-walnut underline underline-offset-2"
              >
                n.magunski@gmail.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
