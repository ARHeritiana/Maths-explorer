"""Command line: python -m mxbuild <command> [options]."""
import argparse, sys


def main(argv=None):
    ap = argparse.ArgumentParser(prog='mxbuild')
    sub = ap.add_subparsers(dest='cmd', required=True)
    c = sub.add_parser('catalog', help='regenerate catalog.json, resources-data.js and RESOURCE_PROVENANCE.json')
    c.add_argument('--check', action='store_true', help='fail if a committed output differs from the manifest')
    args = ap.parse_args(argv)
    if args.cmd == 'catalog':
        from . import catalog
        stale = catalog.write(check=args.check)
        if args.check and stale:
            print('stale generated files (run `make catalog`):', *stale, sep='\n  '); return 1
        print('catalogue: up to date' if not stale else 'catalogue: regenerated ' + ', '.join(map(str, stale)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
