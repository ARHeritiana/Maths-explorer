"""Command line: python -m mxbuild <command> [options]."""
import argparse, sys


def main(argv=None):
    ap = argparse.ArgumentParser(prog='mxbuild')
    sub = ap.add_subparsers(dest='cmd', required=True)
    c = sub.add_parser('catalog', help='regenerate catalog.json, resources-data.js and RESOURCE_PROVENANCE.json')
    c.add_argument('--check', action='store_true', help='fail if a committed output differs from the manifest')
    s = sub.add_parser('site', help='copy site/ into dist/ (the served folder)')
    s.add_argument('--check', action='store_true', help='fail if a dist/ copy differs from site/')
    args = ap.parse_args(argv)
    if args.cmd == 'catalog':
        from . import catalog
        stale = catalog.write(check=args.check)
        if args.check and stale:
            print('stale generated files (run `make catalog`):', *stale, sep='\n  '); return 1
        print('catalogue: up to date' if not stale else 'catalogue: regenerated ' + ', '.join(map(str, stale)))
    if args.cmd == 'site':
        from . import site
        stale = site.write(check=args.check)
        if args.check and stale:
            print('dist/ copies differ from site/ (edit site/, then run `make site`):', *stale, sep='\n  '); return 1
        print('site: up to date' if not stale else f'site: copied {len(stale)} file(s) into dist/')
    return 0


if __name__ == '__main__':
    sys.exit(main())
