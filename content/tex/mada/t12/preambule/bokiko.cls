\NeedsTeXFormat{LaTeX2e}[2020/10/01]
\ProvidesClass{bokiko}[2026/08/23 Professional textbook class]

% Page model -----------------------------------------------------------------
% The historical edition is landscape by default.  Select `portrait` at the
% class level (or compile Main-portrait.tex) for an A4 single-column edition.
\newif\ifTCDLandscape
\TCDLandscapetrue
\DeclareOption{landscape}{\TCDLandscapetrue}
\DeclareOption{portrait}{\TCDLandscapefalse}
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{book}}
\ProcessOptions\relax

\ifTCDLandscape
  \LoadClass[10pt,a4paper,landscape,twoside,openany]{book}
\else
  \LoadClass[10pt,a4paper,twoside,openany]{book}
\fi

\RequirePackage{geometry}
\ifTCDLandscape
  \geometry{
    top=16mm,
    bottom=17mm,
    inner=18mm,
    outer=14mm,
    headheight=14pt,
    headsep=5mm,
    footskip=10mm,
    columnsep=10mm
  }
  \setlength{\columnseprule}{0.25pt}
\else
  \geometry{
    top=18mm,
    bottom=20mm,
    inner=27mm,
    outer=23mm,
    headheight=14pt,
    headsep=6mm,
    footskip=11mm
  }
  \setlength{\columnseprule}{0pt}
\fi

% Apply the orientation-specific body layout only after all packages have
% defined their legacy width registers.
\newcommand{\TCDMainLayout}{%
  \ifTCDLandscape
    \twocolumn
    \setlength{\columnseprule}{0.25pt}%
  \else
    \onecolumn
    \setlength{\columnseprule}{0pt}%
  \fi
  \@ifundefined{actualtextwidth}{}{%
    \setlength{\actualtextwidth}{\columnwidth}%
  }%
}

\newcommand{\TCDOrientationName}{%
  \ifTCDLandscape landscape\else portrait\fi
}

% Typography -----------------------------------------------------------------
\RequirePackage[T1]{fontenc}
\RequirePackage{mathpazo}
\RequirePackage[scaled=0.92]{helvet}
\RequirePackage{microtype}
\RequirePackage{ragged2e}
\RequirePackage{xcolor}
\RequirePackage{titlesec}
\RequirePackage{fancyhdr}
\RequirePackage{emptypage}

% Empty verso pages must contain neither running furniture nor the column rule.
\def\emptypage@emptypage{%
  \begingroup
    \setlength{\columnseprule}{0pt}%
    \hbox{}%
    \thispagestyle{empty}%
    \newpage
    \if@twocolumn
      \hbox{}%
      \newpage
    \fi
  \endgroup
}

\definecolor{TCDInk}{HTML}{20252B}
\definecolor{TCDAccent}{HTML}{8B1E2D}
\definecolor{TCDAccentDark}{HTML}{5E121D}
\definecolor{TCDMuted}{HTML}{626B73}
\definecolor{TCDRule}{HTML}{C8CDD2}
\definecolor{TCDTint}{HTML}{F3ECEE}
\definecolor{TCDDefinition}{HTML}{1F7180}
\definecolor{TCDTheorem}{HTML}{4E5D94}
\definecolor{TCDExample}{HTML}{4F772D}
\definecolor{TCDExercise}{HTML}{9B1C31}
\definecolor{TCDRemark}{HTML}{A56500}
\definecolor{TCDProblem}{HTML}{704080}

\renewcommand{\familydefault}{\rmdefault}
\linespread{1.02}
\setlength{\parindent}{0pt}
\setlength{\parskip}{0.38\baselineskip plus 0.08\baselineskip minus 0.05\baselineskip}
\setlength{\emergencystretch}{2em}
\raggedbottom
\AtBeginDocument{\justifying}

% Document metadata used by the running heads --------------------------------
\providecommand{\TCDShortTitle}{Terminales scientifiques}
\providecommand{\TCDAuthor}{}% no author name in any edition

% Hierarchy -------------------------------------------------------------------
\renewcommand{\thepart}{\Roman{part}}
\renewcommand{\thechapter}{\arabic{chapter}}
\renewcommand{\thesection}{\Roman{section}}
\renewcommand{\thesubsection}{\arabic{subsection}}
\renewcommand{\thesubsubsection}{\alph{subsubsection}}
\renewcommand{\theparagraph}{\roman{paragraph}}
\renewcommand{\thesubparagraph}{\theparagraph.\arabic{subparagraph}}
\setcounter{secnumdepth}{3}
\setcounter{tocdepth}{2}

\titleformat{\part}[display]
  {\thispagestyle{empty}\centering\sffamily\bfseries\color{TCDInk}}
  {\Large\color{TCDAccent}\MakeUppercase{\partname}\enspace\thepart}
  {1.2ex}
  {\Huge}
  [\vspace{1.2ex}{\color{TCDAccent}\titlerule[1.5pt]}]
\titlespacing*{\part}{0pt}{0.18\textheight}{0pt}

\newcommand{\TCDChapterNumber}{%
  \colorbox{TCDAccent}{%
    \makebox[2.2em][c]{\color{white}\thechapter}%
  }%
}

\titleformat{\chapter}[hang]
  {\normalfont\sffamily\bfseries\fontsize{21}{24}\selectfont\color{TCDInk}}
  {\TCDChapterNumber}
  {0.7em}
  {}
  [\vspace{0.25ex}{\color{TCDAccent}\titlerule[1.1pt]}]
\titleformat{name=\chapter,numberless}[block]
  {\normalfont\sffamily\bfseries\fontsize{21}{24}\selectfont\color{TCDInk}}
  {}
  {0pt}
  {}
  [\vspace{0.25ex}{\color{TCDAccent}\titlerule[1.1pt]}]
\titlespacing*{\chapter}{0pt}{0pt}{1.6ex}

\titleformat{\section}
  {\normalfont\sffamily\bfseries\Large\color{TCDAccentDark}}
  {\thesection}
  {0.55em}
  {}
\titlespacing*{\section}{0pt}{2.6ex plus 0.8ex minus 0.4ex}{1.1ex}

\titleformat{\subsection}
  {\normalfont\sffamily\bfseries\large\color{TCDInk}}
  {\thesubsection}
  {0.5em}
  {}
\titlespacing*{\subsection}{0pt}{2.2ex plus 0.6ex minus 0.3ex}{0.8ex}

\titleformat{\subsubsection}
  {\normalfont\sffamily\bfseries\normalsize\color{TCDInk}}
  {\thesubsubsection}
  {0.5em}
  {}
\titlespacing*{\subsubsection}{0pt}{1.8ex plus 0.5ex minus 0.2ex}{0.6ex}

% Running heads ---------------------------------------------------------------
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\chaptermark}[1]{\markboth{#1}{}}
\renewcommand{\sectionmark}[1]{\markright{\thesection\enspace #1}}

\fancyhead[LE,RO]{\sffamily\bfseries\color{TCDAccent}\thepage}
\fancyhead[RE,LO]{\sffamily\small\color{TCDMuted}\nouppercase{\leftmark}}
\fancyfoot[RE,LO]{\sffamily\scriptsize\color{TCDMuted}\TCDShortTitle}
\renewcommand{\headrulewidth}{0.35pt}
\renewcommand{\footrulewidth}{0pt}

\fancypagestyle{plain}{%
  \fancyhf{}
  \fancyfoot[C]{\sffamily\bfseries\color{TCDAccent}\thepage}
  \renewcommand{\headrulewidth}{0pt}
  \renewcommand{\footrulewidth}{0pt}
}

% Used by the legacy revision-sheet environment.
\newcommand{\ps@emptystyleko}{%
  \fancyhf{}
  \fancyhead[LE,RO]{\sffamily\bfseries\color{TCDAccent}\thepage}
  \fancyhead[RE,LO]{\sffamily\small\color{TCDMuted}\TCDShortTitle}
  \renewcommand{\headrulewidth}{0.35pt}
  \renewcommand{\footrulewidth}{0pt}
}

\endinput
