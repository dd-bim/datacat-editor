import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import LinearProgress from "@mui/material/LinearProgress";
import { Paper, Typography, Box, Stack } from "@mui/material";
import ThemeForm from "./forms/ThemeForm";
import DomainClassForm from "./forms/DomainClassForm";
import PropertyGroupForm from "./forms/PropertyGroupForm";
import PropertyForm from "./forms/PropertyForm";
import ValueListForm from "./forms/ValueListForm";
import UnitForm from "./forms/UnitForm";
import ValueForm from "./forms/ValueForm";
import ButtonComponent from "@mui/material/Button";
import { useQuery } from "@apollo/client/react";
import {
  FindPropGroupWithoutPropTreeDocument,
  FindPropWithoutSubjectOrPropGroupTreeDocument,
  FindThemeWithoutSubjectTreeDocument,
  FindSubjectWithoutPropTreeDocument,
  FindValueListWithoutPropTreeDocument,
  FindUnitWithoutValueListTreeDocument,
  FindValueWithoutValueListTreeDocument,
  FindMissingEnglishNameTreeDocument,
  FindMultipleIDsTreeDocument,
  FindMissingDescriptionTreeDocument,
  FindMissingEnglishDescriptionTreeDocument,
  FindMultipleNamesTreeDocument,
  FindMultipleNamesAcrossClassesTreeDocument,
  FindMissingDictionaryTreeDocument,
  FindMissingReferenceDocumentTreeDocument,
  FindInactiveConceptsTreeDocument,
  ObjectPropsFragment,
} from "../generated/graphql";
import {
  ClassEntity,
  DomainClassIcon,
  ThemeIcon,
  DictionaryIcon,
  getEntityType,
  ThemeEntity,
  ValueListEntity,
  MeasureIcon,
  PropertyEntity,
  PropertyGroupEntity,
  PropertyGroupIcon,
  PropertyIcon,
  UnitEntity,
  UnitIcon,
  ValueEntity,
  ValueIcon,
  DictionaryEntity,
  DocumentEntity,
  ReferenceDocumentIcon
} from "../domain";
import { T } from "@tolgee/react";
import DocumentForm from "./forms/DocumentForm";
import DictionaryForm from "./forms/DictionaryForm";
import ItemList from "../components/list/ItemList";

// Type für react-window v2.x onRowsRendered callback
interface OnRowsRenderedProps {
    visibleRows: {
        startIndex: number;
        stopIndex: number;
    };
    allRows: {
        startIndex: number;
        stopIndex: number;
    };
}

// Replace makeStyles with styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  overflow: 'auto',
}));

const HintTypography = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.grey[600],
  padding: theme.spacing(3),
  alignSelf: 'center',
}));

// Add a styled component for left-aligned buttons
const LeftAlignedButton = styled(ButtonComponent)(({ theme }) => ({
  justifyContent: 'flex-start',
  width: '100%',
  textAlign: 'left',
}));

const verificationQueries = {
  "Themen ohne Klasse": {
    document: FindThemeWithoutSubjectTreeDocument,
    dataPath: "findThemeWithoutSubject",
    titleKey: "verification.category.no_theme_class",
    buttonGroup: "Integrität",
  },
  "Klassen ohne Merkmale/Merkmalsgruppen": {
    document: FindSubjectWithoutPropTreeDocument,
    dataPath: "findSubjectWithoutProp",
    titleKey: "verification.category.no_class_properties",
    buttonGroup: "Integrität",
  },
  "Merkmalsgruppen ohne Merkmale": {
    document: FindPropGroupWithoutPropTreeDocument,
    dataPath: "findPropGroupWithoutProp",
    titleKey: "verification.category.no_property_group",
    buttonGroup: "Integrität",
  },
  "Merkmale ohne Klasse oder Merkmalsgruppe": {
    document: FindPropWithoutSubjectOrPropGroupTreeDocument,
    dataPath: "findPropWithoutSubjectOrPropGroup",
    titleKey: "verification.category.no_property",
    buttonGroup: "Integrität",
  },
  "Wertelisten die keinem Merkmal zugeordnet sind": {
    document: FindValueListWithoutPropTreeDocument,
    dataPath: "findValueListWithoutProp",
    titleKey: "verification.category.no_valuelist",
    buttonGroup: "Integrität",
  },
  "Einheiten ohne Werteliste": {
    document: FindUnitWithoutValueListTreeDocument,
    dataPath: "findUnitWithoutValueList",
    titleKey: "verification.category.no_unit",
    buttonGroup: "Integrität",
  },
  "Werte ohne Werteliste": {
    document: FindValueWithoutValueListTreeDocument,
    dataPath: "findValueWithoutValueList",
    titleKey: "verification.category.no_value",
    buttonGroup: "Integrität",
  },
  "ID-Duplikate": {
    document: FindMultipleIDsTreeDocument,
    dataPath: "findMultipleIDs",
    titleKey: "verification.category.duplicate_id",
    buttonGroup: "Eindeutigkeit",
  },
  "Namen-Duplikate (innerhalb eines Types)": {
    document: FindMultipleNamesTreeDocument,
    dataPath: "findMultipleNames",
    titleKey: "verification.category.duplicate_name_type",
    buttonGroup: "Eindeutigkeit",
  },
  "Namen-Duplikate (gesamter Datenbestand)": {
    document: FindMultipleNamesAcrossClassesTreeDocument,
    dataPath: "findMultipleNamesAcrossClasses",
    titleKey: "verification.category.duplicate_name_all",
    buttonGroup: "Eindeutigkeit",
  },
  "Fehlende Beschreibung": {
    document: FindMissingDescriptionTreeDocument,
    dataPath: "findMissingDescription",
    titleKey: "verification.category.missing_description",
    buttonGroup: "Sprache",
  },
  "Fehlende Beschreibung (englisch)": {
    document: FindMissingEnglishDescriptionTreeDocument,
    dataPath: "findMissingEnglishDescription",
    titleKey: "verification.category.missing_description_en",
    buttonGroup: "Sprache",
  },
  "Fehlende Namens-Übersetzung (englisch)": {
    document: FindMissingEnglishNameTreeDocument,
    dataPath: "findMissingEnglishName",
    titleKey: "verification.category.missing_translation_en",
    buttonGroup: "Sprache",
  },
  "Fehlende Dictionary-Zuordnung": {
    document: FindMissingDictionaryTreeDocument,
    dataPath: "findMissingDictionary",
    titleKey: "verification.category.no_dictionary",
    buttonGroup: "Integrität",
  },
  "Fehlende Dokumenten-Zuordnung": {
    document: FindMissingReferenceDocumentTreeDocument,
    dataPath: "findMissingReferenceDocument",
    titleKey: "verification.category.no_document",
    buttonGroup: "Integrität",
  },
  "Inaktive Konzepte": {
    document: FindInactiveConceptsTreeDocument,
    dataPath: "findInactiveConcepts",
    titleKey: "verification.category.inactive_concepts",
    buttonGroup: "Integrität",
  },
};

export function VerificationView() {
  const [selectButton, setSelectButton] = useState("");
  const [selectCategory, setSelectCategory] = useState("");
  const [selectedConcept, setSelectedConcept] = useState<ObjectPropsFragment | null>(null);
  const [title, setTitle] = useState<React.ReactNode>("");

  const handleOnSelect = (concept: ObjectPropsFragment) => {
    setSelectedConcept(concept);
  };

  useEffect(() => {
    setSelectedConcept(null);
  }, [selectCategory, selectButton]);

  useEffect(() => {
    setSelectCategory("");
  }, [selectButton]);

  // Left column: Criteria selection
  const buttonGroups = [
    { key: "Integrität", label: "verification.criteria.integrity" },
    { key: "Eindeutigkeit", label: "verification.criteria.uniqueness" },
    { key: "Sprache", label: "verification.criteria.language" },
  ];

  const renderCriteriaButtons = () => (
    <StyledPaper>
      <Typography variant="h6">
        <T keyName="verification.title" />
      </Typography>
      <Stack direction="column" spacing={1} alignItems="stretch">
        {buttonGroups.map(group => (
          <LeftAlignedButton key={group.key} onClick={() => setSelectButton(group.key)}>
            <T keyName={group.label}>{group.key}</T>
          </LeftAlignedButton>
        ))}
      </Stack>
      <Typography variant="h6" sx={{ mt: 2 }}>
        <T keyName="verification.category_title" />
      </Typography>
      <Stack direction="column" spacing={1} alignItems="stretch">
        {Object.entries(verificationQueries)
          .filter(([_, cfg]) => cfg.buttonGroup === selectButton)
          .map(([cat, cfg]) => (
            <LeftAlignedButton key={cat} onClick={() => setSelectCategory(cat)}>
              <T keyName={cfg.titleKey}>{cat}</T>
            </LeftAlignedButton>
          ))}
      </Stack>
    </StyledPaper>
  );

  // middle column: Results
  useEffect(() => {
    const cfg = verificationQueries[selectCategory as keyof typeof verificationQueries];
    setTitle(cfg ? <T keyName={cfg.titleKey} /> : "");
  }, [selectCategory]);

  const renderResultList = () => {
    const queryConfig = verificationQueries[selectCategory as keyof typeof verificationQueries];
    if (queryConfig) {
      return (
        <GenericVerificationQuery
          document={queryConfig.document}
          dataPath={queryConfig.dataPath}
          onSelect={handleOnSelect}
        />
      );
    }
    return (
      <StyledPaper>
        <HintTypography variant="body1">
          <T keyName="verification.result.select_criteria" />
        </HintTypography>
      </StyledPaper>
    );
  };

  // right column: Detail view
  const entityTypeMap = {
    [ThemeEntity.path]: {
      icon: <ThemeIcon />,
      title: <T keyName="theme.edit" />,
      component: ThemeForm,
    },
    [ClassEntity.path]: {
      icon: <DomainClassIcon />,
      title: <T keyName="class.edit" />,
      component: DomainClassForm,
    },
    [PropertyEntity.path]: {
      icon: <PropertyIcon />,
      title: <T keyName="property.edit" />,
      component: PropertyForm,
    },
    [PropertyGroupEntity.path]: {
      icon: <PropertyGroupIcon />,
      title: <T keyName="propertyGroup.edit" />,
      component: PropertyGroupForm,
    },
    [ValueListEntity.path]: {
      icon: <MeasureIcon />,
      title: <T keyName="valuelist.edit" />,
      component: ValueListForm,
    },
    [UnitEntity.path]: {
      icon: <UnitIcon />,
      title: <T keyName="unit.edit" />,
      component: UnitForm,
    },
    [ValueEntity.path]: {
      icon: <ValueIcon />,
      title: <T keyName="value.edit" />,
      component: ValueForm,
    },
    [DictionaryEntity.path]: {
      icon: <DictionaryIcon />,
      title: <T keyName="dictionary.edit" />,
      component: DictionaryForm,
    },
    [DocumentEntity.path]: {
      icon: <ReferenceDocumentIcon />,
      title: <T keyName="document.edit" />,
      component: DocumentForm,
    },
    default: {
      icon: <DomainClassIcon />,
      title: <T keyName="class.edit" />,
      component: DomainClassForm,
    },
  };

  const renderDetailView = () => {
    if (!selectedConcept) {
      return (
        <HintTypography variant="body1">
          <T keyName="verification.result.select_entry" />
        </HintTypography>
      );
    }
    const { id, recordType, tags } = selectedConcept;
    const entityType = getEntityType(recordType, tags.map((x) => x.id));
    const typeConfig = entityTypeMap[entityType?.path] || entityTypeMap.default;
    const DetailComponent = typeConfig.component;
    return (
      <>
        <Typography variant="h5">
          {typeConfig.icon} {typeConfig.title}
        </Typography>
        <DetailComponent id={id} onDelete={() => setSelectedConcept(null)} />
      </>
    );
  };

  type VerificationQueryProps = {
    document: any;
    dataPath: string;
    onSelect: (concept: ObjectPropsFragment) => void;
  };

  function GenericVerificationQuery({ document, dataPath, onSelect }: VerificationQueryProps) {
    const pageSize = 20;
    const { loading, error, data, fetchMore } = useQuery(document, { variables: { pageNumber: 0, pageSize } });

    // Lokaler State für alle geladenen Items
    const [allItems, setAllItems] = React.useState<ObjectPropsFragment[]>([]);
    const [lastPage, setLastPage] = React.useState<number>(-1);

    // Items aus aktueller Page holen
    const items: ObjectPropsFragment[] = (data?.[dataPath]?.nodes ?? []).slice().sort((a: { name: string; }, b: { name: any; }) => {
      if (!a.name || !b.name) return 0;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    const pageInfo = data?.[dataPath]?.pageInfo;
    const totalElements = data?.[dataPath]?.totalElements ?? 0;

    // Items im State zusammenführen, wenn neue Daten kommen
    React.useEffect(() => {
      if (!pageInfo) return;
      if (pageInfo.pageNumber === 0) {
        setAllItems(items);
        setLastPage(0);
      } else if (pageInfo.pageNumber > lastPage) {
        // Duplikate anhand der ID herausfiltern
        setAllItems(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newUniqueItems = items.filter(item => !existingIds.has(item.id));
          return [...prev, ...newUniqueItems];
        });
        setLastPage(pageInfo.pageNumber);
      }
    }, [data]);

    const handleScroll = async (visibleRows: OnRowsRenderedProps['visibleRows'], allRows: OnRowsRenderedProps['allRows']) => {
      const { stopIndex } = visibleRows;
      if (pageInfo?.hasNext && stopIndex >= allItems.length - 5) {
        await fetchMore({
          variables: {
            pageSize,
            pageNumber: pageInfo.pageNumber + 1
          },
          updateQuery: (prev: any, { fetchMoreResult }: { fetchMoreResult?: any }) => {
            if (!fetchMoreResult) return prev;
            const prevNodes = prev[dataPath].nodes;
            const newNodes = fetchMoreResult[dataPath].nodes;
            // Nur eindeutige Items (nach id)
            const allNodes = [
              ...prevNodes,
              ...newNodes.filter((item: any) => !prevNodes.some((p: any) => p.id === item.id))
            ];
            return {
              ...fetchMoreResult,
              [dataPath]: {
                ...fetchMoreResult[dataPath],
                nodes: allNodes,
                pageInfo: fetchMoreResult[dataPath].pageInfo
              }
            };
          }
        });
      }
    }
console.log(totalElements, " Total Elements");
    if (loading && pageInfo?.pageNumber === 0) return <LinearProgress />;
    if (error) return <p><T keyName="verification.error" /></p>;
    if (!loading && (!allItems || allItems.length === 0)) {
      return <p><T keyName="verification.no_data" /></p>;
    }
    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <T keyName="verification.total_count" />: {totalElements}
        </Typography>
        <ItemList
          loading={loading}
          items={allItems}
          searchLabel={<T keyName="search.search_placeholder" />}
          onItemsRendered={handleScroll}
          height={500}
          onSelect={onSelect}
        />
      </Box>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        minHeight: 'calc(100vh - 140px)',
        width: '100%',
        alignItems: 'flex-start' // Align items to the top
      }}
    >
      {/* Left column - Criteria */}
      <Box sx={{
        width: '20%',
        flexShrink: 0,
        alignSelf: 'flex-start' // Don't stretch vertically
      }}>
        {renderCriteriaButtons()}
      </Box>

      {/* Middle column - Results */}
      <Box sx={{
        width: '30%',
        flexShrink: 0,
        alignSelf: 'flex-start' // Don't stretch vertically
      }}>
        <StyledPaper>
          <Typography variant="h6">{title}</Typography>
          <Box sx={{
            flexGrow: title ? 1 : 0,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {renderResultList()}
          </Box>
        </StyledPaper>
      </Box>

      {/* Right column - Details */}
      <Box sx={{
        flexGrow: 1,
        alignSelf: 'flex-start', // Don't stretch vertically
        minHeight: !selectedConcept ? 'auto' : undefined
      }}>
        <StyledPaper>
          {renderDetailView()}
        </StyledPaper>
      </Box>
    </Stack>
  );
}
