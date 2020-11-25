import {Route, useHistory} from "react-router-dom";
import {
    ClassEntity,
    DocumentEntity,
    GroupEntity,
    ModelEntity,
    PropertyEntity,
    PropertyGroupEntity,
    ValueEntity
} from "../domain";
import React from "react";
import CompositeCatalogEntryView from "../views/CompositeCatalogEntryView";
import DocumentForm from "../views/forms/DocumentForm";
import {EntityTypes} from "../generated/types";
import DomainModelForm from "../views/forms/DomainModelForm";
import DomainGroupForm from "../views/forms/DomainGroupForm";
import DomainClassForm from "../views/forms/DomainClassForm";
import PropertyGroupForm from "../views/forms/PropertyGroupForm";
import PropertyForm from "../views/forms/PropertyForm";
import ValueForm from "../views/forms/ValueForm";

const CatalogEntryRoutes = () => {
    const history = useHistory();
    const onDelete = (path: string) => history.push(`/${path}`);

    return (
        <React.Fragment>

            <Route path={`/${DocumentEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={DocumentEntity}
                    searchInput={{
                        entityTypeIn: [EntityTypes.XtdExternalDocument]
                    }}
                    renderForm={(id => (
                        <DocumentForm
                            id={id}
                            onDelete={() => onDelete(DocumentEntity.path)}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${ModelEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={ModelEntity}
                    searchInput={{
                        entityTypeIn: [ModelEntity.entityType],
                        tagged: ModelEntity.tags,
                    }}
                    renderForm={(id => (
                        <DomainModelForm
                            id={id}
                            onDelete={() => onDelete(ModelEntity.path)}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${GroupEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={GroupEntity}
                    searchInput={{
                        entityTypeIn: [GroupEntity.entityType],
                        tagged: GroupEntity.tags,
                    }}
                    renderForm={(id => (
                        <DomainGroupForm
                            id={id}
                            onDelete={() => onDelete(GroupEntity.path)}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${ClassEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={ClassEntity}
                    searchInput={{
                        entityTypeIn: [ClassEntity.entityType],
                        tagged: ClassEntity.tags,
                    }}
                    renderForm={(id => (
                        <DomainClassForm
                            id={id}
                            onDelete={() => onDelete(ClassEntity.path)}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${PropertyGroupEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={PropertyGroupEntity}
                    searchInput={{
                        entityTypeIn: [PropertyGroupEntity.entityType],
                        tagged: PropertyGroupEntity.tags,
                    }}
                    renderForm={(id => (
                        <PropertyGroupForm
                            id={id}
                            onDelete={() => onDelete(PropertyGroupEntity.path)}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${PropertyEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={PropertyEntity}
                    searchInput={{
                        entityTypeIn: [PropertyEntity.entityType],
                        tagged: PropertyEntity.tags,
                    }}
                    renderForm={(id => (
                        <PropertyForm
                            id={id}
                            onDelete={() => onDelete(PropertyEntity.path)}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${ValueEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={ValueEntity}
                    searchInput={{
                        entityTypeIn: [ValueEntity.entityType],
                        tagged: ValueEntity.tags,
                    }}
                    renderForm={(id => (
                        <ValueForm
                            id={id}
                            onDelete={() => onDelete(ValueEntity.path)}
                        />
                    ))}
                />
            </Route>
        </React.Fragment>
    );
}

export default CatalogEntryRoutes;
