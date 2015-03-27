from django.test import TestCase
from uri import generate_uri
from statements import general_statement
from annotation import add_resource_uri
from exceptions import NoSemanticAnnotationError, InvalidResourceTypeError
from vocab import neonion
from cms import ContentSystem
from django.core.validators import URLValidator


class UriTestCase(TestCase):

    def setUp(self):
        self.resourceType = "http://neonion.org/concept/person"
        self.invalidResourceType = "person"

    def test_equal_uri_mapping(self):
        uri1 = generate_uri(resource_type=self.resourceType, name="Otto Hahn")
        uri2 = generate_uri(resource_type=self.resourceType, name="Otto Hahn")

        self.assertEqual(uri1, uri2)

    def test_not_equal_uri_mapping(self):
        uri1 = generate_uri(resource_type=self.resourceType, name="Otto Hahn")
        uri2 = generate_uri(resource_type=self.resourceType, name="Max Planck")

        self.assertNotEqual(uri1, uri2)

    def test_random_uri_mapping(self):
        uri1 = generate_uri(resource_type=self.resourceType)
        uri2 = generate_uri(resource_type=self.resourceType)

        self.assertNotEqual(uri1, uri2)

    def test_invalid_uri_mapping(self):
        self.assertRaises(InvalidResourceTypeError, generate_uri, resource_type=self.invalidResourceType)


class StatementsTestCase(TestCase):

    def setUp(self):
        self.noSemanticAnnotation = {
            "quote": "Otto Hahn"
        }

        self.semanticAnnotationWithoutURI = {
            "quote": "Otto Hahn",
            "rdf": {
                "label": "Name of resource",
                "typeof": "http://neonion.org/concept/person"
            }
        }

        self.semanticAnnotation = {
            "quote": "Otto Hahn",
            "rdf": {
                "label": "Name of resource",
                "uri": "http://neonion.org/person/123456",
                "typeof": "http://neonion.org/concept/person"
            }
        }

        self.semanticAnnotationWithSameAs = {
            "quote": "Otto Hahn",
            "rdf": {
                "label": "Name of resource",
                "uri": 'http://neonion.org/person/123456',
                "typeof": "http://neonion.org/concept/person",
                "sameAs": "http://de.dbpedia.org/page/Otto_Hahn"
            }
        }

    def test_no_semantic_annotation(self):
        self.assertRaises(NoSemanticAnnotationError, general_statement, self.noSemanticAnnotation)

    def test_semantic_annotation(self):
        statement = general_statement(self.semanticAnnotation)
        self.assertTrue("rdf:type" in statement)
        self.assertTrue("rdfs:label" in statement)

    def test_semantic_annotation_with_same_as(self):
        statement = general_statement(self.semanticAnnotationWithSameAs)
        self.assertTrue("owl:sameAs" in statement)

    def test_add_uri_to_invalid_annotation(self):
        self.assertRaises(NoSemanticAnnotationError, add_resource_uri, self.noSemanticAnnotation)

    def test_add_uri_to_valid_annotation(self):
        annotation = self.semanticAnnotationWithoutURI
        self.assertFalse("uri" in annotation['rdf'])
        annotation = add_resource_uri(self.semanticAnnotationWithoutURI)
        self.assertTrue("uri" in annotation['rdf'])


class VocabTestCase(TestCase):

    def test_valid_urls(self):
        """ Tests whether the vocab contains only valid URLs. """
        vocab = neonion()
        vocab_uri = [vocab.ANNOTATION_SET, vocab.CONCEPT, vocab.LINKED_CONCEPT]
        validate = URLValidator()
        for uri in vocab_uri:
            self.assertIsNone(validate(uri))


class ContentSystemTestCase(TestCase):

    def test_abstract_cms(self):
        cms = ContentSystem()
        # expect NotImplementedError on all calls
        self.assertRaises(NotImplementedError, cms.list)
        self.assertRaises(NotImplementedError, cms.get_document, None)
        self.assertRaises(NotImplementedError, cms.get_meta, None)
        self.assertRaises(NotImplementedError, cms.search, None)