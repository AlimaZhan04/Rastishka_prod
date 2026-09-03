import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
        <p className="text-primary text-sm font-medium">Статус документа: черновик</p>
        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight">
          Проект политики обработки персональных данных
        </h1>
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          Этот текст подготовлен для рабочего прототипа. До публикации сайта в production он должен
          быть проверен и утверждён юристом вместе с реквизитами оператора, сроками хранения данных
          и порядком отзыва согласия.
        </div>
        <div className="text-muted-foreground mt-8 space-y-6 text-sm leading-6">
          <section>
            <h2 className="font-heading text-foreground text-lg font-medium">
              Какие данные собираются
            </h2>
            <p className="mt-2">
              В предварительной анкете пользователь указывает контактные данные родителя и сведения,
              необходимые для первичной оценки формата сопровождения ребёнка.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-foreground text-lg font-medium">Для чего они нужны</h2>
            <p className="mt-2">
              Данные используются только для обработки обращения, подготовки предварительного
              профиля и связи с пользователем. Они не предназначены для рекламной рассылки без
              отдельного согласия.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-foreground text-lg font-medium">
              Как защищаются данные
            </h2>
            <p className="mt-2">
              Доступ к заявкам предоставляется только уполномоченным сотрудникам. Технические
              журналы не содержат содержимое анкеты, номер телефона или иные персональные данные.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-foreground text-lg font-medium">
              Отзыв согласия и вопросы
            </h2>
            <p className="mt-2">
              Контакты оператора и окончательный порядок отзыва согласия будут добавлены после
              юридического утверждения документа. До этого момента сайт не должен публиковаться как
              production-сервис сбора персональных данных.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
