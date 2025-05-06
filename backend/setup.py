from setuptools import setup, find_packages

setup(
    name='vocabulary_learning',
    version='0.1',
    packages=find_packages(),
    install_requires=[
        'flask',
        'flask-cors',
        'pymysql',
        'python-dotenv',
        'bcrypt'
    ]
) 