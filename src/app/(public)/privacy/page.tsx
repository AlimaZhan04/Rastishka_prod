import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных | РАСтишка",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-primary">Статус документа: черновик</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
          Проект политики обработки персональных данных
        </h1>
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          Этот текст подготовлен для рабочего прототипа. До публикации сайта в production он
          должен быть проверен и утверждён юристом вместе с реквизитами оператора, сроками
          хранения данных и порядком отзыва согласия.
        </div>
        <div className="mt-8 space-y-6 text-sm leading-6 text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-medium text-foreground">Какие данные собираются</h2>
            <p className="mt-2">
              В предварительной анкете пользователь указывает контактные данные родителя и
              сведения, необходимые для первичной оценки формата сопровождения ребёнка.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-medium text-foreground">Для чего они нужны</h2>
            <p className="mt-2">
              Данные используются только для обработки обращения, подготовки предварительного
              профиля и связи с пользователем. Они не предназначены для рекламной рассылки без
              отдельного согласия.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-medium text-foreground">Как защищаются данные</h2>
            <p className="mt-2">
              Доступ к заявкам предоставляется только уполномоченным сотрудникам. Технические
              журналы не содержат содержимое анкеты, номер телефона или иные персональные данные.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-medium text-foreground">Отзыв согласия и вопросы</h2>
            <p className="mt-2">
              Контакты оператора и окончательный порядок отзыва согласия будут добавлены после
              юридического утверждения документа. До этого момента сайт не должен публиковаться
              как production-сервис сбора персональных данных.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
