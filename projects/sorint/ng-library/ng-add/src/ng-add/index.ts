
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { getWorkspace } from '@schematics/angular/utility/config';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import * as ts from 'typescript';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function ngAdd(_options: any): Rule {
  return chain([
    updatePackageToDependencies('@sorint/ng-library', '^0.0.1'),
    addModuleImport()
  ]);
}

function updatePackageToDependencies(pkg: string, version: string): Rule {
  return (host: Tree, _context: SchematicContext) => {
    // tslint:disable-next-line:no-non-null-assertion
    const sourceText = host.read('package.json')!.toString('utf-8');
    const json = JSON.parse(sourceText);

    json['dependencies'][pkg] = version;
    host.overwrite('package.json', JSON.stringify(json, null, 2));

    return host;
  };
}

function addModuleImport(): Rule {
  return (host: Tree, _context: SchematicContext) => {
    const workspace = getWorkspace(host);
    // tslint:disable-next-line:no-non-null-assertion
    const defaultProject = workspace.projects[workspace.defaultProject!];

    // tslint:disable-next-line:no-non-null-assertion
    const appModulePath: string = getAppModulePath(host, defaultProject.targets!.build.options.main);

    const buffer = host.read(appModulePath);
    if (!buffer) { return _context.logger.warn('error'); }

    const content = buffer.toString();
    const appModuleSource: ts.SourceFile = ts.createSourceFile(appModulePath, content, ts.ScriptTarget.Latest, true);

    const changes = addImportToModule(appModuleSource, appModulePath, 'NgLibraryModule', '@sorint/ng-library');
    const recorder = host.beginUpdate(appModulePath);

    changes.forEach(change => {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    });

    host.commitUpdate(recorder);

    return host;
  };
}




