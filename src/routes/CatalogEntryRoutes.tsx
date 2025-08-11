import CompositeCatalogEntryView from "../views/CompositeCatalogEntryView";
import DocumentForm from "../views/forms/DocumentForm";
import ThemeForm from "../views/forms/ThemeForm";
import DomainClassForm from "../views/forms/DomainClassForm";
import PropertyGroupForm from "../views/forms/PropertyGroupForm";
import PropertyForm from "../views/forms/PropertyForm";
import ValueListForm from "../views/forms/ValueListForm";
import UnitForm from "../views/forms/UnitForm";
import ValueForm from "../views/forms/ValueForm";
import DictionaryForm from "../views/forms/DictionaryForm";
import {
  ClassEntity,
  DocumentEntity,
  ThemeEntity,
  ValueListEntity,
  DictionaryEntity,
  PropertyEntity,
  PropertyGroupEntity,
  UnitEntity,
  ValueEntity
} from "../domain";

export const catalogEntryRoutes = [
  {
    path: `/${DocumentEntity.path}/:id?`,
    element: (
      <CompositeCatalogEntryView
        entryType={DocumentEntity}
        renderForm={(id) => (
          <DocumentForm id={id}/>
        )}
      />
    ),
  },
  {
    path: `/${DictionaryEntity.path}/:id?`,
    element: (
      <CompositeCatalogEntryView
        entryType={DictionaryEntity}
        renderForm={(id) => (
          <DictionaryForm id={id}/>
        )}
      />
    ),
  },
  {
    path: `/${ThemeEntity.path}/:id?`,
    element: (
      <CompositeCatalogEntryView
        entryType={ThemeEntity}
        renderForm={(id) => (
          <ThemeForm id={id}/>
        )}
      />
    ),
  },
  {
    path: `/${ClassEntity.path}/:id?`,
    element: (
      <CompositeCatalogEntryView
        entryType={ClassEntity}
        renderForm={(id) => (
          <DomainClassForm id={id}/>
        )}
      />
    ),
  },
  {
    path: `/${PropertyGroupEntity.path}/:id?`,
    element: (
      <CompositeCatalogEntryView
        entryType={PropertyGroupEntity}
        renderForm={(id) => (
          <PropertyGroupForm id={id}/>
        )}
      />
    ),
  },
  {
    path: `/${PropertyEntity.path}/:id?`,
    element: (
      <CompositeCatalogEntryView
        entryType={PropertyEntity}
        renderForm={(id) => (
          <PropertyForm id={id}/>
        )}
      />
    ),
  },
  {
    path: `/${ValueListEntity.path}/:id?`,
    element: (
      <CompositeCatalogEntryView
        entryType={ValueListEntity}
        renderForm={(id) => (
          <ValueListForm id={id}/>
        )}
      />
    ),
  },
  {
    path: `/${UnitEntity.path}/:id?`,
    element: (
      <CompositeCatalogEntryView
        entryType={UnitEntity}
        renderForm={(id) => (
          <UnitForm id={id}/>
        )}
      />
    ),
  },
  {
    path: `/${ValueEntity.path}/:id?`,
    element: (
      <CompositeCatalogEntryView
        entryType={ValueEntity}
        renderForm={(id) => (
          <ValueForm id={id}/>
        )}
      />
    ),
  },
];