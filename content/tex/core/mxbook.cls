% mxbook.cls -- Maths Explorer document class (pdfLaTeX, mathpazo).
% Options (key=value):
%   course=<id>                    course identifier, used in running heads and labels (default: none)
%   lang=fr|en                     language of labels, hyphenation and number formatting (default: fr)
%   edition=student|teacher|both   teacher material is shown for teacher and both (default: student)
%   layout=booklet|sheet|slide-figs page design: two-sided booklet, one-sided sheet, or a bare page for figure export
%   unit=chapter|sequence          name printed before a unit number in booklets (default: chapter)
%   sections=numbered|unnumbered   unnumbered: sections carry no number and the contents list chapters only
% Every course main is a few lines: \documentclass[course=...,lang=...,edition=...]{mxbook}, \begin{document},
% then \mxinclude{...} for each unit. Units never load packages or define macros.
\NeedsTeXFormat{LaTeX2e}[2022/06/01]
\ProvidesClass{mxbook}[2026/10/11 Maths Explorer class]

\def\mx@course{}\def\mx@lang{fr}\def\mx@edition{student}\def\mx@layout{booklet}\def\mx@unitname{chapter}\def\mx@sections{numbered}
\ExplSyntaxOn
\DeclareKeys{
  course.store = \mx@course,
  lang.choices:nn = {fr,en}{\cs_set_nopar:Npx \mx@lang {\l_keys_choice_tl}},
  edition.choices:nn = {student,teacher,both}{\cs_set_nopar:Npx \mx@edition {\l_keys_choice_tl}},
  layout.choices:nn = {booklet,sheet,slide-figs}{\cs_set_nopar:Npx \mx@layout {\l_keys_choice_tl}},
  unit.choices:nn = {chapter,sequence}{\cs_set_nopar:Npx \mx@unitname {\l_keys_choice_tl}},
  sections.choices:nn = {numbered,unnumbered}{\cs_set_nopar:Npx \mx@sections {\l_keys_choice_tl}},
}
\ExplSyntaxOff
\ProcessKeyOptions\relax

\def\mx@tmp{booklet}
\ifx\mx@layout\mx@tmp
  \LoadClass[11pt,a4paper,twoside,openany]{book}
\else
  \LoadClass[11pt,a4paper,oneside,openany]{book}
\fi

\RequirePackage{mx-i18n}     % language, labels, dates, number formatting (reads \mx@lang)
\RequirePackage{mx-edition}  % \ifmxteacher and teacher-only material (reads \mx@edition)
\RequirePackage{mx-math}     % mathematics macros (\R, \vect, ...), defined once for books, slides and site
\RequirePackage{mx-figures}  % colours, TikZ and pgfplots styles
\RequirePackage{mx-layout}   % geometry, headings, running heads, page-break policy (reads \mx@layout, \mx@course)
\RequirePackage{mx-env}      % canonical environments (keypoint, method, example, exercise, ...)
\RequirePackage{mx-code}     % Python listings
\RequirePackage[hidelinks,unicode]{hyperref}   % last, as hyperref requires

% ---- French/English page balance -----------------------------------------------------------------------------------
% Every block (a unit, or a session in session books) records its first page in \jobname.mxb. The build compares the
% French and English records and, where one language is shorter, writes \mxsetpad{block}{pages} into \jobname.mxpad;
% that many lined "Notes" pages then close the block, so both languages keep the same page numbers block by block.
\newcounter{mxblock}
\newwrite\mx@blockfile
\AtBeginDocument{\immediate\openout\mx@blockfile=\jobname.mxb\relax\InputIfFileExists{\jobname.mxpad}{}{}}
\newcommand{\mxsetpad}[2]{\expandafter\def\csname mx@pad@#1\endcsname{#2}}
\newcommand{\mx@notespage}{\clearpage\section*{\mxlabelof{notes}}\mxnotelines\clearpage}
% ruled lines filling exactly the rest of the page
\newcommand{\mxnotelines}{\par{\color{mxline}\leaders\vbox to 8mm{\vss\hrule width\linewidth height .4pt}\vfill}}
% \mx@newblock: close the previous block (padding), start a new page and record the new block with its absolute
% page index (pages shipped so far + 1; independent of roman front-matter numbering).
\newcommand{\mx@newblock}{%
  \ifcsname mx@pad@\the\c@mxblock\endcsname
    \foreach\mx@k in {1,...,\csname mx@pad@\the\c@mxblock\endcsname}{\mx@notespage}%
  \fi
  \clearpage\stepcounter{mxblock}%
  \immediate\write\mx@blockfile{\the\c@mxblock\space\the\numexpr\ReadonlyShipoutCounter+1\relax}}
\AtEndDocument{\mx@newblock}   % pads the last block and records the end

\def\mx@unnumbered{unnumbered}
\ifx\mx@sections\mx@unnumbered\setcounter{secnumdepth}{0}\setcounter{tocdepth}{0}\fi

% \mxinclude{path}: input a unit by its path below content/tex (no extension); the language suffix is added here,
% so a main lists units once for both languages. Example: \mxinclude{courses/premiere/c05} reads c05.fr.tex or c05.en.tex.
\newcommand{\mxinclude}[1]{\input{#1.\mx@lang.tex}}
% \mxunit{id}{title}: opens a unit; the id namespaces labels written with \mxlabel{name} as id:name.
\newcommand{\mxunitid}{}
% A unit starts a new page: a chapter in the booklet layout, a section in the sheet layout. Per-unit PDF excerpts
% therefore never carry the end of the previous unit.
\def\mx@sheet{sheet}
\newcommand{\mxunit}[2]{\renewcommand{\mxunitid}{#1}\mx@newblock
  \ifx\mx@layout\mx@sheet\section{#2}\else\chapter{#2}\fi\label{#1}}
% \mxsubtitle{text}: a line under a unit heading (dates, period).
\newcommand{\mxsubtitle}[1]{{\color{mxmuted}\sffamily #1\par}\medskip}
% \mxnewpage: a page break that is also a balanced block (FR/EN page parity is kept at every such break).
\newcommand{\mxnewpage}{\mx@newblock}
% \mxsection{title}: a section that starts a new page and is balanced like a unit (worksheets).
\newcommand{\mxsection}[1]{\mx@newblock\section{#1}}
% \mxfront{id}: opens a unit without heading (title block, introduction).
\newcommand{\mxfront}[1]{\renewcommand{\mxunitid}{#1}}
\newcommand{\mxlabel}[1]{\label{\mxunitid:#1}}
\newcommand{\mxref}[1]{\ref{#1}}
