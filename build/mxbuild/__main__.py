"""Command line: python -m mxbuild <command> [options]."""
import argparse, sys


def main(argv=None):
    ap = argparse.ArgumentParser(prog='mxbuild')
    sub = ap.add_subparsers(dest='cmd', required=True)
    c = sub.add_parser('catalog', help='regenerate catalog.json, resources-data.js and RESOURCE_PROVENANCE.json')
    c.add_argument('--check', action='store_true', help='fail if a committed output differs from the manifest')
    s = sub.add_parser('site', help='copy site/ into dist/ (the served folder)')
    s.add_argument('--check', action='store_true', help='fail if a dist/ copy differs from site/')
    t = sub.add_parser('tex', help='build course PDFs (cached), style them, regenerate the catalogue, republish sources')
    t.add_argument('courses', nargs='*', help='courses (default: all)')
    t.add_argument('--force', action='store_true', help='ignore the cache')
    k = sub.add_parser('check', help='run every pre-push check')
    k.add_argument('--fast', action='store_true', help='skip the browser and slides smoke tests')
    sub.add_parser('twin', help='French-to-English unit generation: align | gen | check (see mxbuild/twin.py)', add_help=False)
    argv = sys.argv[1:] if argv is None else argv
    if argv and argv[0] == 'twin':
        from . import twin
        return twin.main(argv[1:])
    args = ap.parse_args(argv)
    if args.cmd == 'catalog':
        from . import catalog
        stale = catalog.write(check=args.check)
        if args.check and stale:
            print('stale generated files (run `make catalog`):', *stale, sep='\n  '); return 1
        print('catalogue: up to date' if not stale else 'catalogue: regenerated ' + ', '.join(map(str, stale)))
    if args.cmd == 'tex':
        from . import pipeline
        unknown = set(args.courses) - set(pipeline.COURSES)
        if unknown: ap.error('unknown course(s): ' + ', '.join(sorted(unknown)))
        return pipeline.build_tex(args.courses or list(pipeline.COURSES), force=args.force)
    if args.cmd == 'check':
        from . import pipeline
        return pipeline.check(fast=args.fast)
    if args.cmd == 'site':
        from . import site
        stale = site.write(check=args.check)
        if args.check and stale:
            print('dist/ copies differ from site/ (edit site/, then run `make site`):', *stale, sep='\n  '); return 1
        print('site: up to date' if not stale else f'site: copied {len(stale)} file(s) into dist/')
    return 0


if __name__ == '__main__':
    sys.exit(main())
