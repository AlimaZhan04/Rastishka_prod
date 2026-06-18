# -*- coding: utf-8 -*-
"""Генерация диаграмм для анализа предметной области РАСтишка."""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Ellipse, Rectangle, Circle

plt.rcParams["font.family"] = "DejaVu Sans"

OUT = os.path.dirname(os.path.abspath(__file__))

# Бренд-палитра
WINE   = "#7E2A3D"
ROSE   = "#F8E3E6"
BLUSH  = "#F2C4CB"
SAGE   = "#838B72"
SAGE_L = "#E4E7DD"
CREAM  = "#F7F1EA"
WHITE  = "#FFFFFF"
INK    = "#3A2E2E"


def rbox(ax, x, y, w, h, text, fill=WHITE, edge=WINE, tc=INK, fs=10, lw=1.6, bold=False):
    ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h,
                 boxstyle="round,pad=0.02,rounding_size=0.18",
                 fc=fill, ec=edge, lw=lw, zorder=2))
    ax.text(x, y, text, ha="center", va="center", fontsize=fs, color=tc,
            fontweight="bold" if bold else "normal", zorder=3, wrap=True)


def ellipse(ax, x, y, w, h, text, fill=ROSE, edge=WINE, tc=INK, fs=9):
    ax.add_patch(Ellipse((x, y), w, h, fc=fill, ec=edge, lw=1.6, zorder=2))
    ax.text(x, y, text, ha="center", va="center", fontsize=fs, color=tc, zorder=3)


def arrow(ax, x1, y1, x2, y2, color=SAGE, dashed=False, lw=1.6, style="-|>"):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style,
                 mutation_scale=14, color=color, lw=lw,
                 linestyle="--" if dashed else "-",
                 shrinkA=4, shrinkB=4, zorder=1))


def actor(ax, x, y, label, color=WINE):
    ax.add_patch(Circle((x, y + 0.45), 0.18, fc=WHITE, ec=color, lw=2, zorder=3))
    ax.plot([x, x], [y + 0.27, y - 0.25], color=color, lw=2, zorder=3)
    ax.plot([x - 0.28, x + 0.28], [y + 0.05, y + 0.05], color=color, lw=2, zorder=3)
    ax.plot([x, x - 0.22], [y - 0.25, y - 0.6], color=color, lw=2, zorder=3)
    ax.plot([x, x + 0.22], [y - 0.25, y - 0.6], color=color, lw=2, zorder=3)
    ax.text(x, y - 0.95, label, ha="center", va="center", fontsize=9.5,
            color=color, fontweight="bold", zorder=3)


def setup(w=16, h=11):
    fig, ax = plt.subplots(figsize=(w / 1.6, h / 1.6), dpi=170)
    ax.set_xlim(0, w)
    ax.set_ylim(0, h)
    ax.axis("off")
    return fig, ax


# ---------------------------------------------------------------- 1. USE-CASE
def d_usecase():
    fig, ax = setup(17, 12)
    ax.text(8.5, 11.5, "Диаграмма вариантов использования — сайт «РАСтишка»",
            ha="center", fontsize=13, fontweight="bold", color=WINE)

    # Граница системы
    ax.add_patch(Rectangle((4.3, 0.8), 8.4, 9.9, fc=CREAM, ec=SAGE, lw=2, zorder=0))
    ax.text(8.5, 10.35, "Сайт «РАСтишка»", ha="center", fontsize=11,
            fontweight="bold", color=SAGE)

    # Акторы
    actor(ax, 1.4, 8.6, "Родитель")
    actor(ax, 1.4, 3.2, "Соискатель")
    actor(ax, 15.6, 8.6, "Контент-\nменеджер")
    actor(ax, 15.6, 4.3, "Администратор")

    # Вторичный актор — системы уведомлений
    rbox(ax, 8.5, 0.42, 5.6, 0.72, "Уведомления: Telegram · WhatsApp · Email",
         fill=SAGE, edge=SAGE, tc=WHITE, fs=9, bold=True)

    # Use-cases (левая колонка — родитель/соискатель)
    L = 6.3
    uc_info  = (L, 9.6); ellipse(ax, *uc_info, 3.4, 1.0, "Изучить информацию\n«Для кого мы»")
    uc_quiz  = (L, 8.0); ellipse(ax, *uc_quiz, 3.4, 1.0, "Пройти опросник\n(«Записаться»)")
    uc_req   = (L, 6.4); ellipse(ax, *uc_req, 3.4, 1.0, "Получить индивид.\nтребования ребёнка", fill=BLUSH)
    uc_shop  = (L, 4.8); ellipse(ax, *uc_shop, 3.4, 1.0, "Заказать\nфирменный товар")
    uc_news  = (L, 3.3); ellipse(ax, *uc_news, 3.4, 0.95, "Читать новости\nи объявления")
    uc_vac   = (L, 1.8); ellipse(ax, *uc_vac, 3.4, 0.95, "Откликнуться\nна вакансию")

    # Use-cases (правая колонка — персонал)
    R = 10.7
    uc_cms   = (R, 9.0); ellipse(ax, *uc_cms, 3.4, 1.0, "Управлять контентом\n(новости/вакансии/товары)", fill=SAGE_L)
    uc_req2  = (R, 6.4); ellipse(ax, *uc_req2, 3.4, 1.0, "Обрабатывать заявки,\nотклики и заказы", fill=SAGE_L)
    uc_users = (R, 3.8); ellipse(ax, *uc_users, 3.4, 1.0, "Управлять\nпользователями и ролями", fill=SAGE_L)

    # Связи актор-usecase
    for uc in (uc_info, uc_quiz, uc_shop, uc_news):
        arrow(ax, 1.9, 8.4, uc[0] - 1.7, uc[1], color="#B98",  style="-")
    arrow(ax, 1.9, 3.0, uc_vac[0] - 1.7, uc_vac[1], color="#B98", style="-")

    arrow(ax, 15.1, 8.6, uc_cms[0] + 1.7, uc_cms[1], color="#B98", style="-")
    arrow(ax, 15.1, 4.6, uc_cms[0] + 1.7, uc_cms[1] - 0.3, color="#B98", style="-")
    arrow(ax, 15.1, 4.4, uc_req2[0] + 1.7, uc_req2[1], color="#B98", style="-")
    arrow(ax, 15.1, 4.2, uc_users[0] + 1.7, uc_users[1], color="#B98", style="-")

    # include: опросник -> индивид. требования
    arrow(ax, uc_quiz[0], uc_quiz[1] - 0.5, uc_req[0], uc_req[1] + 0.5, color=WINE, dashed=True)
    ax.text(L + 1.5, 7.2, "«include»", fontsize=8, color=WINE, style="italic")

    # заявки -> уведомления
    arrow(ax, uc_req2[0], uc_req2[1] - 0.5, 8.9, 0.82, color=WINE, dashed=True)
    ax.text(10.3, 3.4, "«trigger»", fontsize=8, color=WINE, style="italic")

    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "01_usecase.png"), bbox_inches="tight", facecolor=WHITE)
    plt.close(fig)


# ----------------------------------------------------- helper: вертик. flow
def vflow(ax, cx, nodes, top=11.4, gap=1.45):
    """nodes: list of (text, kind). kind: start|proc|io|end|note"""
    ys = []
    y = top
    for text, kind in nodes:
        fill, edge, tc, bold = WHITE, WINE, INK, False
        if kind == "start" or kind == "end":
            fill, edge, tc, bold = WINE, WINE, WHITE, True
        elif kind == "io":
            fill, edge = ROSE, WINE
        elif kind == "note":
            fill, edge, tc = SAGE, SAGE, WHITE
        rbox(ax, cx, y, 6.6, 0.95, text, fill=fill, edge=edge, tc=tc, fs=9.5, bold=bold)
        ys.append(y)
        y -= gap
    for i in range(len(ys) - 1):
        arrow(ax, cx, ys[i] - 0.48, cx, ys[i + 1] + 0.48, color=SAGE)
    return ys


# ----------------------------------------------------- 2. ПРОЦЕСС: ЗАПИСЬ
def d_process_zapis():
    fig, ax = setup(11, 13)
    ax.text(5.5, 12.6, "Бизнес-процесс «Запись ребёнка через опросник»",
            ha="center", fontsize=12.5, fontweight="bold", color=WINE)
    nodes = [
        ("Родитель заходит на сайт", "start"),
        ("Изучает «Для кого мы» и варианты посещения", "proc"),
        ("Нажимает кнопку «Записаться»", "proc"),
        ("Проходит анкету из 7 шагов\n(форма посещения · речь · поведение ·\nтуалет · питание · опыт · контакты)", "io"),
        ("Система формирует индивидуальный\nпрофиль и требования ребёнка", "note"),
        ("«Отправить» → запись сохраняется в БД", "proc"),
        ("Авто-уведомление администратору:\nTelegram / WhatsApp / Email + ссылка в админку", "note"),
        ("Администратор перезванивает, подбирает\nгруппу и индивидуальный маршрут", "proc"),
        ("Ребёнок записан, назначен маршрут занятий", "end"),
    ]
    vflow(ax, 5.5, nodes, top=11.6, gap=1.4)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "02_process_zapis.png"), bbox_inches="tight", facecolor=WHITE)
    plt.close(fig)


# ----------------------------------------------------- 3. ПРОЦЕСС: ВАКАНСИИ
def d_process_vacancy():
    fig, ax = setup(11, 13)
    ax.text(5.5, 12.6, "Бизнес-процесс «Отклик на вакансию»",
            ha="center", fontsize=12.5, fontweight="bold", color=WINE)
    nodes = [
        ("Соискатель открывает раздел «Вакансии»", "start"),
        ("Просматривает карточки\n(превью до 100 символов)", "proc"),
        ("Нажимает «Откликнуться» →\nполная карточка (обязанности,\nтребования, мы предлагаем)", "proc"),
        ("Заполняет форму: ФИО, телефон,\nрезюме (файл) или текст до 2000 символов", "io"),
        ("«Отправить» → запись сохраняется в БД", "proc"),
        ("Авто-уведомление администратору:\nTelegram / WhatsApp / Email + ссылка в админку", "note"),
        ("Администратор связывается с кандидатом", "proc"),
        ("Шеринг вакансии: Instagram · Facebook · Threads", "end"),
    ]
    vflow(ax, 5.5, nodes, top=11.6, gap=1.45)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "03_process_vacancy.png"), bbox_inches="tight", facecolor=WHITE)
    plt.close(fig)


# ----------------------------------------------------- 4. ИНТЕГРАЦИИ
def d_integrations():
    fig, ax = setup(15, 9)
    ax.text(7.5, 8.5, "Схема интеграций и автоматических уведомлений",
            ha="center", fontsize=12.5, fontweight="bold", color=WINE)

    # Источники (триггеры)
    rbox(ax, 2.2, 6.6, 3.4, 1.0, "Заявка на запись\n(опросник)", fill=ROSE, fs=9.5)
    rbox(ax, 2.2, 4.5, 3.4, 1.0, "Отклик на вакансию", fill=ROSE, fs=9.5)
    rbox(ax, 2.2, 2.4, 3.4, 1.0, "Заказ товара", fill=ROSE, fs=9.5)

    # Ядро
    rbox(ax, 7.5, 4.5, 3.8, 2.4, "Сайт «РАСтишка»\n+ База данных\n\nСохранение и\nмаршрутизация событий",
         fill=WINE, edge=WINE, tc=WHITE, fs=10, bold=True)

    for sy in (6.6, 4.5, 2.4):
        arrow(ax, 3.9, sy, 5.6, 4.5, color=SAGE)

    # Каналы
    rbox(ax, 12.6, 7.0, 3.6, 0.95, "Telegram-бот", fill=SAGE, edge=SAGE, tc=WHITE, fs=9.5, bold=True)
    rbox(ax, 12.6, 5.5, 3.6, 0.95, "WhatsApp", fill=SAGE, edge=SAGE, tc=WHITE, fs=9.5, bold=True)
    rbox(ax, 12.6, 4.0, 3.6, 0.95, "E-mail", fill=SAGE, edge=SAGE, tc=WHITE, fs=9.5, bold=True)
    rbox(ax, 12.6, 2.4, 3.6, 0.95, "Админ-панель\n(карточка заявки)", fill=WHITE, edge=WINE, fs=9)

    for ty in (7.0, 5.5, 4.0, 2.4):
        arrow(ax, 9.4, 4.5, 10.8, ty, color=WINE)

    ax.text(10.1, 6.5, "уведомление\nо новом событии", fontsize=8, color=WINE,
            style="italic", ha="center")
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "04_integrations.png"), bbox_inches="tight", facecolor=WHITE)
    plt.close(fig)


# ----------------------------------------------------- 5. МОДЕЛЬ ДАННЫХ
def entity(ax, x, y, w, title, attrs, hcol=WINE):
    n = len(attrs)
    h = 0.55 + n * 0.36
    ax.add_patch(FancyBboxPatch((x - w / 2, y - h), w, h,
                 boxstyle="round,pad=0.01,rounding_size=0.06",
                 fc=WHITE, ec=hcol, lw=1.6, zorder=2))
    ax.add_patch(FancyBboxPatch((x - w / 2, y - 0.5), w, 0.5,
                 boxstyle="square,pad=0", fc=hcol, ec=hcol, lw=1.6, zorder=3))
    ax.text(x, y - 0.25, title, ha="center", va="center", fontsize=9.5,
            color=WHITE, fontweight="bold", zorder=4)
    for i, a in enumerate(attrs):
        ax.text(x - w / 2 + 0.18, y - 0.78 - i * 0.36, a, ha="left", va="center",
                fontsize=8, color=INK, zorder=4)
    return (x, y, w, h)


def d_datamodel():
    fig, ax = setup(16.5, 12.2)
    ax.text(8.25, 11.9, "Модель данных предметной области (основные сущности)",
            ha="center", fontsize=12.5, fontweight="bold", color=WINE)

    # --- Ряд 1 (родительские сущности) ---
    entity(ax, 3.2, 11.0, 4.4, "Заявка (анкета)",
        ["id, дата, статус", "форма посещения", "развитие речи", "поведение",
         "навыки туалета", "навыки питания", "опыт занятий", "имя, телефон"])
    entity(ax, 8.25, 11.0, 4.4, "Вакансия",
        ["id, заголовок", "превью (100)", "обязанности", "требования",
         "мы предлагаем", "теги (SEO), активна"])
    entity(ax, 13.3, 11.0, 4.6, "Товар",
        ["id, картинка", "описание (автор)", "размер, цвет", "цена, остаток", "теги (SEO)"])

    # --- Ряд 2 (зависимые сущности) ---
    entity(ax, 3.2, 6.2, 4.4, "Профиль ребёнка",
        ["id, заявка_id", "уровень речи", "поведение", "самостоятельность",
         "рекомендации", "маршрут занятий"], hcol=SAGE)
    entity(ax, 8.25, 6.2, 4.4, "Отклик",
        ["id, вакансия_id", "ФИО, телефон", "резюме (файл)", "текст (2000)", "дата"])
    entity(ax, 13.3, 6.2, 4.6, "Заказ",
        ["id, товар_id", "кол-во, сумма", "ФИО, телефон", "дата, статус"])

    # Связи (чистые вертикали, без пересечений)
    arrow(ax, 3.2, 7.57, 3.2, 6.2, color=WINE, dashed=True, style="-|>")
    ax.text(3.5, 6.9, "1 — 1", fontsize=8.5, color=WINE)
    arrow(ax, 8.25, 8.29, 8.25, 6.2, color=WINE, style="-|>")
    ax.text(8.55, 7.25, "1 — *", fontsize=8.5, color=WINE)
    arrow(ax, 13.3, 8.65, 13.3, 6.2, color=WINE, style="-|>")
    ax.text(13.6, 7.4, "1 — *", fontsize=8.5, color=WINE)

    # --- Ряд 3 (контент и доступ) ---
    entity(ax, 4.3, 3.0, 4.4, "Новость",
        ["id, заголовок", "дата (авто)", "текст, картинка", "теги (SEO)"])
    entity(ax, 11.6, 3.0, 5.2, "Пользователь",
        ["id, логин", "роль: Администратор / Контент-менеджер"], hcol=SAGE)

    # Управление контентом — подпись (без линий, чтобы не загромождать)
    ax.add_patch(FancyBboxPatch((6.95, 0.35), 8.7, 1.15,
                 boxstyle="round,pad=0.04,rounding_size=0.1",
                 fc=CREAM, ec=SAGE, lw=1.4, zorder=2))
    ax.text(11.3, 0.93,
            "Пользователь создаёт и редактирует контент (CRUD):\n"
            "новости · вакансии · товары — все данные динамические",
            ha="center", va="center", fontsize=8.5, color=INK, zorder=3)
    arrow(ax, 11.6, 1.37, 11.6, 1.5, color=SAGE, dashed=True, style="-|>")

    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "05_datamodel.png"), bbox_inches="tight", facecolor=WHITE)
    plt.close(fig)


if __name__ == "__main__":
    d_usecase()
    d_process_zapis()
    d_process_vacancy()
    d_integrations()
    d_datamodel()
    print("Diagrams generated in", OUT)
