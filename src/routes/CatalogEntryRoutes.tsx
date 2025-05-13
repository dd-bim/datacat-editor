import React from "react";
import CompositeCatalogEntryView from "../views/CompositeCatalogEntryView";
import DocumentForm from "../views/forms/DocumentForm";
import DomainModelForm from "../views/forms/DomainModelForm";
import DomainGroupForm from "../views/forms/DomainGroupForm";
import DomainClassForm from "../views/forms/DomainClassForm";
import PropertyGroupForm from "../views/forms/PropertyGroupForm";
import PropertyForm from "../views/forms/PropertyForm";
import MeasureForm from "../views/forms/MeasureForm";
import UnitForm from "../views/forms/UnitForm";
import ValueForm from "../views/forms/ValueForm";

import {
  ClassEntity,
  DocumentEntity,
  GroupEntity,
  MeasureEntity,
  ModelEntity,
  PropertyEntity,
  PropertyGroupEntity,
  UnitEntity,
  ValueEntity
} from "../domain";

// Dummy-Funktion für den onDelete-Handler. 

const dummyOnDelete = () => {
  console.warn("onDelete wurde aufgerufen – implementieren Sie die Navigation in der Komponente oder per Context.");
};

export const catalogEntryRoutes = [
  {
    path: `/${DocumentEntity.path}/:id?`,
    element: (
      <CompositeCatalogEntryView
        entryType={DocumentEntity}
        renderForm={(id) => (
          <DocumentForm id={id} onDelete={dummyOnDelete} />
        )}
      />
    ),
  },
  {
    path: `/${ModelEntity.path}/:id?`,
    element: (
      <CompositeCatalogEntryView
        entryType={ModelEntity}
        renderForm={(id) => (
          <DomainModelForm id={id} onDelete={dummyOnDelete} />
        )}
      />
    ),
  },
  {
    path: `/${GroupEntity.path}/:id?`,
    element: (
      <CompositeCatalogEntryView
        entryType={GroupEntity}
        renderForm={(id) => (
          <DomainGroupForm id={id} onDelete={dummyOnDelete} />
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
          <DomainClassForm id={id} onDelete={dummyOnDelete} />
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
          <PropertyGroupForm id={id} onDelete={dummyOnDelete} />
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
          <PropertyForm id={id} onDelete={dummyOnDelete} />
        )}
      />
    ),
  },
  {
    path: `/${MeasureEntity.path}/:id?`,
    element: (
      <CompositeCatalogEntryView
        entryType={MeasureEntity}
        renderForm={(id) => (
          <MeasureForm id={id} onDelete={dummyOnDelete} />
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
          <UnitForm id={id} onDelete={dummyOnDelete} />
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
          <ValueForm id={id} onDelete={dummyOnDelete} />
        )}
      />
    ),
  },
];

export default catalogEntryRoutes;